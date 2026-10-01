import { InMemoryDbService, Customer } from '../../database/in-memory-db.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CustomersService {
    private readonly db;
    constructor(db: InMemoryDbService);
    findAll(query: PaginationQueryDto): {
        data: Customer[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    findById(id: string): Customer;
    create(dto: CreateCustomerDto): Customer;
}
