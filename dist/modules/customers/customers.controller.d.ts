import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(query: PaginationQueryDto): {
        data: import("../../database/in-memory-db.service").Customer[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    create(dto: CreateCustomerDto): import("../../database/in-memory-db.service").Customer;
    findById(id: string): import("../../database/in-memory-db.service").Customer;
}
