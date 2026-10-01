import { ProductsService } from './products.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: PaginationQueryDto): {
        data: import("../../database/in-memory-db.service").Product[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    findById(id: string): import("../../database/in-memory-db.service").Product;
}
