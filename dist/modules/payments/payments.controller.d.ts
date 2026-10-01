import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentIntentDto } from './dto/confirm-payment-intent.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(query: PaginationQueryDto): {
        data: import("../../database/in-memory-db.service").PaymentIntent[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    create(dto: CreatePaymentIntentDto): import("../../database/in-memory-db.service").PaymentIntent;
    findById(id: string): import("../../database/in-memory-db.service").PaymentIntent;
    confirm(id: string, idempotencyKey: string, dto: ConfirmPaymentIntentDto): {
        message: string;
        paymentIntent: import("../../database/in-memory-db.service").PaymentIntent;
        invoice: import("../../database/in-memory-db.service").Invoice;
        customerPoints: number;
        idempotencyKeyUsed?: undefined;
        customerReward?: undefined;
    } | {
        message: string;
        idempotencyKeyUsed: string;
        paymentIntent: import("../../database/in-memory-db.service").PaymentIntent;
        invoice: import("../../database/in-memory-db.service").Invoice;
        customerReward: {
            customerId: string;
            customerName: string;
            poinBonusAwarded: number;
            totalPoinSekarang: number;
        };
        customerPoints?: undefined;
    };
    secureCheck(id: string): {
        message: string;
        payment: import("../../database/in-memory-db.service").PaymentIntent;
    };
}
