import { InMemoryDbService, Invoice, PaymentIntent } from '../../database/in-memory-db.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class InvoicesService {
    private readonly db;
    constructor(db: InMemoryDbService);
    findAll(query: PaginationQueryDto): {
        data: Invoice[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    findById(id: string): Invoice;
    create(dto: CreateInvoiceDto): {
        message: string;
        invoice: Invoice;
        paymentIntent: PaymentIntent;
    };
}
