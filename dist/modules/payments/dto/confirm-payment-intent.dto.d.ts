export declare class ConfirmPaymentIntentDto {
    paymentMethod?: 'qris' | 'cash' | 'bank_transfer';
    amountPaid?: number;
    notes?: string;
}
