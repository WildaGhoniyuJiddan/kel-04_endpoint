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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const in_memory_db_service_1 = require("../../database/in-memory-db.service");
let InvoicesService = class InvoicesService {
    db;
    constructor(db) {
        this.db = db;
    }
    findAll(query) {
        let items = Array.from(this.db.invoices.values());
        if (query.status) {
            items = items.filter((inv) => inv.status.toUpperCase() === query.status?.toUpperCase());
        }
        if (query.search) {
            const s = query.search.toLowerCase();
            items = items.filter((inv) => inv.id.toLowerCase().includes(s) ||
                inv.customerName.toLowerCase().includes(s) ||
                inv.customerId.toLowerCase().includes(s));
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
        const invoice = this.db.invoices.get(id);
        if (!invoice) {
            throw new common_1.NotFoundException({
                type: 'https://api.example.com/errors/resource-missing',
                error: 'Not Found',
                code: 'resource_missing',
                message: `Invoice nota belanja dengan ID "${id}" tidak ditemukan.`,
                param: 'id',
            });
        }
        return invoice;
    }
    create(dto) {
        const customer = this.db.customers.get(dto.customerId);
        if (!customer) {
            throw new common_1.NotFoundException({
                type: 'https://api.example.com/errors/resource-missing',
                error: 'Not Found',
                code: 'resource_missing',
                message: `Customer dengan ID "${dto.customerId}" tidak terdaftar di Toko SRC.`,
                param: 'customerId',
            });
        }
        let totalAmount = 0;
        const items = [];
        for (const itemDto of dto.items) {
            const product = this.db.products.get(itemDto.productId);
            if (!product) {
                throw new common_1.NotFoundException({
                    type: 'https://api.example.com/errors/resource-missing',
                    error: 'Not Found',
                    code: 'resource_missing',
                    message: `Produk "${itemDto.productId}" tidak ditemukan.`,
                    param: 'productId',
                });
            }
            if (product.stock < itemDto.quantity) {
                throw new common_1.BadRequestException({
                    type: 'https://api.example.com/errors/parameter-invalid',
                    error: 'Bad Request',
                    code: 'insufficient_stock',
                    message: `Stok barang "${product.name}" tidak mencukupi! Tersedia: ${product.stock}, diminta: ${itemDto.quantity}.`,
                    param: 'quantity',
                });
            }
            const subtotal = product.price * itemDto.quantity;
            totalAmount += subtotal;
            items.push({
                productId: product.id,
                productName: product.name,
                quantity: itemDto.quantity,
                unitPrice: product.price,
                subtotal,
            });
        }
        const invoiceId = `INV-SRC-${Date.now().toString().slice(-4)}`;
        const newInvoice = {
            id: invoiceId,
            customerId: customer.id,
            customerName: customer.name,
            items,
            totalAmount,
            status: 'UNPAID',
            createdAt: new Date(),
        };
        this.db.invoices.set(invoiceId, newInvoice);
        const paymentIntentId = `pi_src_${(0, uuid_1.v4)().substring(0, 6)}`;
        const newPaymentIntent = {
            id: paymentIntentId,
            invoiceId: newInvoice.id,
            customerId: customer.id,
            amount: totalAmount,
            currency: 'idr',
            status: 'requires_confirmation',
            paymentMethod: 'qris',
            createdAt: new Date(),
        };
        this.db.paymentIntents.set(paymentIntentId, newPaymentIntent);
        return {
            message: 'Nota belanja berhasil dibuat di kasir Toko SRC.',
            invoice: newInvoice,
            paymentIntent: newPaymentIntent,
        };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_db_service_1.InMemoryDbService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map