import { Injectable } from '@nestjs/common';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  poinKoinKelontong: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: Date;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'UNPAID' | 'PAID' | 'CANCELLED';
  createdAt: Date;
}

export interface PaymentIntent {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  currency: 'idr';
  status: 'requires_confirmation' | 'succeeded' | 'canceled';
  paymentMethod: 'qris' | 'cash' | 'bank_transfer';
  idempotencyKey?: string;
  confirmedAt?: Date;
  createdAt: Date;
}

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  status: 'IN_PROGRESS' | 'RESOLVED';
  responseStatus?: number;
  responseBody?: any;
  createdAt: Date;
}

@Injectable()
export class InMemoryDbService {
  public customers: Map<string, Customer> = new Map();
  public products: Map<string, Product> = new Map();
  public invoices: Map<string, Invoice> = new Map();
  public paymentIntents: Map<string, PaymentIntent> = new Map();
  public idempotencyRecords: Map<string, IdempotencyRecord> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.customers.clear();
    this.products.clear();
    this.invoices.clear();
    this.paymentIntents.clear();
    this.idempotencyRecords.clear();

    const now = new Date();

    // 1. Seed Customer (Member Toko Kelontong SRC)
    this.customers.set('cust_src_01', {
      id: 'cust_src_01',
      name: 'Bu Siti Rahayu',
      email: 'siti.rahayu@src-kelontong.id',
      phone: '081234567890',
      poinKoinKelontong: 50,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
    });

    this.customers.set('cust_src_02', {
      id: 'cust_src_02',
      name: 'Pak Joko Widodo',
      email: 'joko.widodo@src-kelontong.id',
      phone: '081298765432',
      poinKoinKelontong: 120,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
    });

    this.customers.set('cust_src_03', {
      id: 'cust_src_03',
      name: 'Mbak Dewi Sartika',
      email: 'dewi.sartika@src-kelontong.id',
      phone: '081311223344',
      poinKoinKelontong: 0,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
    });

    // 2. Seed Product Sembako Toko SRC
    this.products.set('prod_beras_5kg', {
      id: 'prod_beras_5kg',
      name: 'Beras Ramos Super 5kg',
      category: 'Sembako',
      price: 75000,
      stock: 25,
      createdAt: now,
    });

    this.products.set('prod_minyak_2l', {
      id: 'prod_minyak_2l',
      name: 'Minyak Goreng Sawit 2L',
      category: 'Sembako',
      price: 38000,
      stock: 40,
      createdAt: now,
    });

    this.products.set('prod_gula_1kg', {
      id: 'prod_gula_1kg',
      name: 'Gula Pasir Kristal Putih 1kg',
      category: 'Sembako',
      price: 17500,
      stock: 50,
      createdAt: now,
    });

    this.products.set('prod_kopi_sachet', {
      id: 'prod_kopi_sachet',
      name: 'Kopi Tubruk Sachet Renceng (10 pcs)',
      category: 'Minuman',
      price: 15000,
      stock: 100,
      createdAt: now,
    });

    // 3. Seed Invoice
    this.invoices.set('INV-SRC-1001', {
      id: 'INV-SRC-1001',
      customerId: 'cust_src_01',
      customerName: 'Bu Siti Rahayu',
      items: [
        {
          productId: 'prod_minyak_2l',
          productName: 'Minyak Goreng Sawit 2L',
          quantity: 1,
          unitPrice: 38000,
          subtotal: 38000,
        },
        {
          productId: 'prod_gula_1kg',
          productName: 'Gula Pasir Kristal Putih 1kg',
          quantity: 2,
          unitPrice: 17500,
          subtotal: 35000,
        },
      ],
      totalAmount: 73000,
      status: 'UNPAID',
      createdAt: new Date(now.getTime() - 1000 * 60 * 30),
    });

    this.invoices.set('INV-SRC-1002', {
      id: 'INV-SRC-1002',
      customerId: 'cust_src_02',
      customerName: 'Pak Joko Widodo',
      items: [
        {
          productId: 'prod_beras_5kg',
          productName: 'Beras Ramos Super 5kg',
          quantity: 1,
          unitPrice: 75000,
          subtotal: 75000,
        },
      ],
      totalAmount: 75000,
      status: 'PAID',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
    });

    // 4. Seed Payment Intent
    this.paymentIntents.set('pi_src_1001', {
      id: 'pi_src_1001',
      invoiceId: 'INV-SRC-1001',
      customerId: 'cust_src_01',
      amount: 73000,
      currency: 'idr',
      status: 'requires_confirmation',
      paymentMethod: 'qris',
      createdAt: new Date(now.getTime() - 1000 * 60 * 25),
    });

    this.paymentIntents.set('pi_src_1002', {
      id: 'pi_src_1002',
      invoiceId: 'INV-SRC-1002',
      customerId: 'cust_src_02',
      amount: 75000,
      currency: 'idr',
      status: 'succeeded',
      paymentMethod: 'qris',
      confirmedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
    });
  }

  getStateSummary() {
    return {
      customersCount: this.customers.size,
      productsCount: this.products.size,
      invoicesCount: this.invoices.size,
      paymentIntentsCount: this.paymentIntents.size,
      idempotencyRecordsCount: this.idempotencyRecords.size,
    };
  }
}
