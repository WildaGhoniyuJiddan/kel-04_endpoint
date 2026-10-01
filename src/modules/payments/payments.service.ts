import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  InMemoryDbService,
  PaymentIntent,
} from '../../database/in-memory-db.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentIntentDto } from './dto/confirm-payment-intent.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll(query: PaginationQueryDto) {
    let items = Array.from(this.db.paymentIntents.values());

    // Filter by status (e.g. requires_confirmation, succeeded)
    if (query.status) {
      items = items.filter(
        (pi) => pi.status.toLowerCase() === query.status?.toLowerCase(),
      );
    }

    // Filter by search (id or invoiceId)
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (pi) =>
          pi.id.toLowerCase().includes(s) ||
          pi.invoiceId.toLowerCase().includes(s) ||
          pi.customerId.toLowerCase().includes(s),
      );
    }

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA > valB) return sortOrder;
      if (valA < valB) return -sortOrder;
      return 0;
    });

    // Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  findById(id: string): PaymentIntent {
    const paymentIntent = this.db.paymentIntents.get(id);
    if (!paymentIntent) {
      throw new NotFoundException({
        type: 'https://api.example.com/errors/resource-missing',
        error: 'Not Found',
        code: 'resource_missing',
        message: `Payment Intent dengan ID "${id}" tidak ditemukan.`,
        param: 'id',
      });
    }
    return paymentIntent;
  }

  create(dto: CreatePaymentIntentDto) {
    const invoice = this.db.invoices.get(dto.invoiceId);
    if (!invoice) {
      throw new NotFoundException({
        type: 'https://api.example.com/errors/resource-missing',
        error: 'Not Found',
        code: 'resource_missing',
        message: `Invoice dengan ID "${dto.invoiceId}" tidak ditemukan.`,
        param: 'invoiceId',
      });
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException({
        type: 'https://api.example.com/errors/parameter-invalid',
        error: 'Bad Request',
        code: 'invoice_already_paid',
        message: `Invoice "${dto.invoiceId}" sudah lunas dibayar sebelumnya!`,
        param: 'invoiceId',
      });
    }

    const newId = `pi_src_${uuidv4().substring(0, 6)}`;
    const newPaymentIntent: PaymentIntent = {
      id: newId,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: invoice.totalAmount,
      currency: 'idr',
      status: 'requires_confirmation',
      paymentMethod: dto.paymentMethod || 'qris',
      createdAt: new Date(),
    };

    this.db.paymentIntents.set(newId, newPaymentIntent);
    return newPaymentIntent;
  }

  /**
   * Operasi POST KRITIKAL:
   * Mengonfirmasi pelunasan pembayaran secara Idempoten.
   * Efek samping:
   * 1. Status PaymentIntent -> 'succeeded'
   * 2. Status Invoice -> 'PAID'
   * 3. Pemotongan stok barang di gudang toko SRC
   * 4. Penambahan Koin Poin Toko SRC (+200 poin) untuk pelanggan
   */
  confirm(id: string, dto: ConfirmPaymentIntentDto, idempotencyKey: string) {
    const paymentIntent = this.findById(id);

    // Cari invoice terkait
    const invoice = this.db.invoices.get(paymentIntent.invoiceId);
    if (!invoice) {
      throw new NotFoundException({
        type: 'https://api.example.com/errors/resource-missing',
        error: 'Not Found',
        code: 'resource_missing',
        message: `Invoice ${paymentIntent.invoiceId} terkait Payment Intent ini tidak ditemukan.`,
      });
    }

    // Jika sudah lunas (bisa terjadi jika tanpa interceptor atau dicek langsung)
    if (paymentIntent.status === 'succeeded' && invoice.status === 'PAID') {
      const customer = this.db.customers.get(paymentIntent.customerId);
      return {
        message: 'Payment Intent sudah berhasil lunas sebelumnya.',
        paymentIntent,
        invoice,
        customerPoints: customer?.poinKoinKelontong,
      };
    }

    // 1. Potong Stok Barang Kelontong
    for (const item of invoice.items) {
      const product = this.db.products.get(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        this.db.products.set(product.id, product);
      }
    }

    // 2. Update Status PaymentIntent & Invoice
    paymentIntent.status = 'succeeded';
    paymentIntent.paymentMethod = dto.paymentMethod || paymentIntent.paymentMethod;
    paymentIntent.idempotencyKey = idempotencyKey;
    paymentIntent.confirmedAt = new Date();
    this.db.paymentIntents.set(paymentIntent.id, paymentIntent);

    invoice.status = 'PAID';
    this.db.invoices.set(invoice.id, invoice);

    // 3. Beri Poin Reward Toko SRC (+200 Koin) ke Pelanggan
    const customer = this.db.customers.get(paymentIntent.customerId);
    const poinBonus = 200;
    if (customer) {
      customer.poinKoinKelontong += poinBonus;
      this.db.customers.set(customer.id, customer);
    }

    return {
      message: 'Pembayaran berhasil dikonfirmasi dan dicatat lunas!',
      idempotencyKeyUsed: idempotencyKey,
      paymentIntent,
      invoice,
      customerReward: {
        customerId: customer?.id,
        customerName: customer?.name,
        poinBonusAwarded: poinBonus,
        totalPoinSekarang: customer?.poinKoinKelontong,
      },
    };
  }
}
