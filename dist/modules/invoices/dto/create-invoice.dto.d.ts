export declare class InvoiceItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateInvoiceDto {
    customerId: string;
    items: InvoiceItemDto[];
}
