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
export declare class InMemoryDbService {
    customers: Map<string, Customer>;
    products: Map<string, Product>;
    invoices: Map<string, Invoice>;
    paymentIntents: Map<string, PaymentIntent>;
    idempotencyRecords: Map<string, IdempotencyRecord>;
    constructor();
    reset(): void;
    getStateSummary(): {
        customersCount: number;
        productsCount: number;
        invoicesCount: number;
        paymentIntentsCount: number;
        idempotencyRecordsCount: number;
    };
}
