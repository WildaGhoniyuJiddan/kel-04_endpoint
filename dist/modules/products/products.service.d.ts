import { InMemoryDbService, Product } from '../../database/in-memory-db.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class ProductsService {
    private readonly db;
    constructor(db: InMemoryDbService);
    findAll(query: PaginationQueryDto): {
        data: Product[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    findById(id: string): Product;
}
