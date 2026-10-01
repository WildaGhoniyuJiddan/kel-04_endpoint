import { InMemoryDbService, PaymentIntent } from '../../database/in-memory-db.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentIntentDto } from './dto/confirm-payment-intent.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class PaymentsService {
    private readonly db;
    constructor(db: InMemoryDbService);
    findAll(query: PaginationQueryDto): {
        data: PaymentIntent[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    findById(id: string): PaymentIntent;
    create(dto: CreatePaymentIntentDto): PaymentIntent;
    confirm(id: string, dto: ConfirmPaymentIntentDto, idempotencyKey: string): {
        message: string;
        paymentIntent: PaymentIntent;
        invoice: import("../../database/in-memory-db.service").Invoice;
        customerPoints: number;
        idempotencyKeyUsed?: undefined;
        customerReward?: undefined;
    } | {
        message: string;
        idempotencyKeyUsed: string;
        paymentIntent: PaymentIntent;
        invoice: import("../../database/in-memory-db.service").Invoice;
        customerReward: {
            customerId: string;
            customerName: string;
            poinBonusAwarded: number;
            totalPoinSekarang: number;
        };
        customerPoints?: undefined;
    };
}
