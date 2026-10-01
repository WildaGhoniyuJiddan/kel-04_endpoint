import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(query: PaginationQueryDto): {
        data: import("../../database/in-memory-db.service").Invoice[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    create(dto: CreateInvoiceDto): {
        message: string;
        invoice: import("../../database/in-memory-db.service").Invoice;
        paymentIntent: import("../../database/in-memory-db.service").PaymentIntent;
    };
    findById(id: string): import("../../database/in-memory-db.service").Invoice;
}
