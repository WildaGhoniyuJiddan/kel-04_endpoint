import { InMemoryDbService } from '../../database/in-memory-db.service';
export declare class StateController {
    private readonly db;
    constructor(db: InMemoryDbService);
    getState(): {
        message: string;
        summary: {
            customersCount: number;
            productsCount: number;
            invoicesCount: number;
            paymentIntentsCount: number;
            idempotencyRecordsCount: number;
        };
        customers: import("../../database/in-memory-db.service").Customer[];
        products: import("../../database/in-memory-db.service").Product[];
        invoices: import("../../database/in-memory-db.service").Invoice[];
        paymentIntents: import("../../database/in-memory-db.service").PaymentIntent[];
        idempotencyRecords: import("../../database/in-memory-db.service").IdempotencyRecord[];
    };
    resetState(): {
        message: string;
        summary: {
            customersCount: number;
            productsCount: number;
            invoicesCount: number;
            paymentIntentsCount: number;
            idempotencyRecordsCount: number;
        };
    };
}
