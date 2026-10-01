"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const in_memory_db_service_1 = require("../../database/in-memory-db.service");
let ProductsService = class ProductsService {
    db;
    constructor(db) {
        this.db = db;
    }
    findAll(query) {
        let items = Array.from(this.db.products.values());
        if (query.search) {
            const s = query.search.toLowerCase();
            items = items.filter((p) => p.name.toLowerCase().includes(s) ||
                p.category.toLowerCase().includes(s) ||
                p.id.toLowerCase().includes(s));
        }
        const sortBy = query.sortBy || 'name';
        const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
        items.sort((a, b) => {
            const valA = a[sortBy] ?? '';
            const valB = b[sortBy] ?? '';
            if (valA > valB)
                return sortOrder;
            if (valA < valB)
                return -sortOrder;
            return 0;
        });
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const total = items.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const paginatedItems = items.slice(startIndex, startIndex + limit);
        return {
            data: paginatedItems,
            meta: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
    findById(id) {
        const product = this.db.products.get(id);
        if (!product) {
            throw new common_1.NotFoundException({
                type: 'https://api.example.com/errors/resource-missing',
                error: 'Not Found',
                code: 'resource_missing',
                message: `Produk sembako dengan ID "${id}" tidak ditemukan di Toko SRC.`,
                param: 'id',
            });
        }
        return product;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_db_service_1.InMemoryDbService])
], ProductsService);
//# sourceMappingURL=products.service.js.map