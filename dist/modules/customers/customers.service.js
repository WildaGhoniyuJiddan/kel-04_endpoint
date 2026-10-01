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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const in_memory_db_service_1 = require("../../database/in-memory-db.service");
let CustomersService = class CustomersService {
    db;
    constructor(db) {
        this.db = db;
    }
    findAll(query) {
        let items = Array.from(this.db.customers.values());
        if (query.search) {
            const s = query.search.toLowerCase();
            items = items.filter((c) => c.name.toLowerCase().includes(s) ||
                c.email.toLowerCase().includes(s) ||
                c.id.toLowerCase().includes(s));
        }
        const sortBy = query.sortBy || 'createdAt';
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
        const customer = this.db.customers.get(id);
        if (!customer) {
            throw new common_1.NotFoundException({
                type: 'https://api.example.com/errors/resource-missing',
                error: 'Not Found',
                code: 'resource_missing',
                message: `Pelanggan Toko SRC dengan ID "${id}" tidak ditemukan.`,
                param: 'id',
            });
        }
        return customer;
    }
    create(dto) {
        const newId = `cust_src_${(0, uuid_1.v4)().substring(0, 6)}`;
        const newCustomer = {
            id: newId,
            name: dto.name,
            email: dto.email,
            phone: dto.phone || '-',
            poinKoinKelontong: 0,
            createdAt: new Date(),
        };
        this.db.customers.set(newId, newCustomer);
        return newCustomer;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_db_service_1.InMemoryDbService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map