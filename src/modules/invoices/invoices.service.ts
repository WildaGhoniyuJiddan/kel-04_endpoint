import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  InMemoryDbService,
  Invoice,
  InvoiceItem,
  PaymentIntent,
} from '../../database/in-memory-db.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll(query: PaginationQueryDto) {
    let items = Array.from(this.db.invoices.values());

    // Filter by status (e.g. UNPAID, PAID)
    if (query.status) {
      items = items.filter(
        (inv) => inv.status.toUpperCase() === query.status?.toUpperCase(),
      );
    }

    // Filter search by customer name or ID
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (inv) =>
          inv.id.toLowerCase().includes(s) ||
          inv.customerName.toLowerCase().includes(s) ||
          inv.customerId.toLowerCase().includes(s),
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

  findById(id: string): Invoice {
    const invoice = this.db.invoices.get(id);
    if (!invoice) {
      throw new NotFoundException({
        type: 'https://api.example.com/errors/resource-missing',
        error: 'Not Found',
        code: 'resource_missing',
        message: `Invoice nota belanja dengan ID "${id}" tidak ditemukan.`,
        param: 'id',
      });
    }
    return invoice;
  }

  create(dto: CreateInvoiceDto) {
    // 1. Validasi Customer
    const customer = this.db.customers.get(dto.customerId);
    if (!customer) {
      throw new NotFoundException({
        type: 'https://api.example.com/errors/resource-missing',
        error: 'Not Found',
        code: 'resource_missing',
        message: `Customer dengan ID "${dto.customerId}" tidak terdaftar di Toko SRC.`,
        param: 'customerId',
      });
    }

    // 2. Validasi Item & Hitung Total
    let totalAmount = 0;
    const items: InvoiceItem[] = [];

    for (const itemDto of dto.items) {
      const product = this.db.products.get(itemDto.productId);
      if (!product) {
        throw new NotFoundException({
          type: 'https://api.example.com/errors/resource-missing',
          error: 'Not Found',
          code: 'resource_missing',
          message: `Produk "${itemDto.productId}" tidak ditemukan.`,
          param: 'productId',
        });
      }

      if (product.stock < itemDto.quantity) {
        throw new BadRequestException({
          type: 'https://api.example.com/errors/parameter-invalid',
          error: 'Bad Request',
          code: 'insufficient_stock',
          message: `Stok barang "${product.name}" tidak mencukupi! Tersedia: ${product.stock}, diminta: ${itemDto.quantity}.`,
          param: 'quantity',
        });
      }

      const subtotal = product.price * itemDto.quantity;
      totalAmount += subtotal;

      items.push({
        productId: product.id,
        productName: product.name,
        quantity: itemDto.quantity,
        unitPrice: product.price,
        subtotal,
      });
    }

    const invoiceId = `INV-SRC-${Date.now().toString().slice(-4)}`;
    const newInvoice: Invoice = {
      id: invoiceId,
      customerId: customer.id,
      customerName: customer.name,
      items,
      totalAmount,
      status: 'UNPAID',
      createdAt: new Date(),
    };

    this.db.invoices.set(invoiceId, newInvoice);

    // Otomatis buat Payment Intent terkait untuk mempermudah alur checkout kasir
    const paymentIntentId = `pi_src_${uuidv4().substring(0, 6)}`;
    const newPaymentIntent: PaymentIntent = {
      id: paymentIntentId,
      invoiceId: newInvoice.id,
      customerId: customer.id,
      amount: totalAmount,
      currency: 'idr',
      status: 'requires_confirmation',
      paymentMethod: 'qris',
      createdAt: new Date(),
    };
    this.db.paymentIntents.set(paymentIntentId, newPaymentIntent);

    return {
      message: 'Nota belanja berhasil dibuat di kasir Toko SRC.',
      invoice: newInvoice,
      paymentIntent: newPaymentIntent,
    };
  }
}
