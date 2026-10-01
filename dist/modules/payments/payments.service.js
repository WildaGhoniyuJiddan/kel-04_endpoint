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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const in_memory_db_service_1 = require("../../database/in-memory-db.service");
let PaymentsService = class PaymentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    findAll(query) {
        let items = Array.from(this.db.paymentIntents.values());
        if (query.status) {
            items = items.filter((pi) => pi.status.toLowerCase() === query.status?.toLowerCase());
        }
        if (query.search) {
            const s = query.search.toLowerCase();
            items = items.filter((pi) => pi.id.toLowerCase().includes(s) ||
                pi.invoiceId.toLowerCase().includes(s) ||
                pi.customerId.toLowerCase().includes(s));
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
        const paymentIntent = this.db.paymentIntents.get(id);
        if (!paymentIntent) {
            throw new common_1.NotFoundException({
                type: 'https://api.example.com/errors/resource-missing',
                error: 'Not Found',
                code: 'resource_missing',
                message: `Payment Intent dengan ID "${id}" tidak ditemukan.`,
                param: 'id',
            });
        }
        return paymentIntent;
    }
    create(dto) {
        const invoice = this.db.invoices.get(dto.invoiceId);
        if (!invoice) {
            throw new common_1.NotFoundException({
                type: 'https://api.example.com/errors/resource-missing',
                error: 'Not Found',
                code: 'resource_missing',
                message: `Invoice dengan ID "${dto.invoiceId}" tidak ditemukan.`,
                param: 'invoiceId',
            });
        }
        if (invoice.status === 'PAID') {
            throw new common_1.BadRequestException({
                type: 'https://api.example.com/errors/parameter-invalid',
                error: 'Bad Request',
                code: 'invoice_already_paid',
                message: `Invoice "${dto.invoiceId}" sudah lunas dibayar sebelumnya!`,
                param: 'invoiceId',
            });
        }
        const newId = `pi_src_${(0, uuid_1.v4)().substring(0, 6)}`;
        const newPaymentIntent = {
            id: newId,
            invoiceId: invoice.id,
            customerId: invoice.customerId,
            amount: invoice.totalAmount,
            currency: 'idr',
            status: 'requires_confirmation',
            paymentMethod: dto.paymentMethod || 'qris',
            createdAt: new Date(),
        };
        this.db.paymentIntents.set(newId, newPaymentIntent);
        return newPaymentIntent;
    }
    confirm(id, dto, idempotencyKey) {
        const paymentIntent = this.findById(id);
        const invoice = this.db.invoices.get(paymentIntent.invoiceId);
        if (!invoice) {
            throw new common_1.NotFoundException({
                type: 'https://api.example.com/errors/resource-missing',
                error: 'Not Found',
                code: 'resource_missing',
                message: `Invoice ${paymentIntent.invoiceId} terkait Payment Intent ini tidak ditemukan.`,
            });
        }
        if (paymentIntent.status === 'succeeded' && invoice.status === 'PAID') {
            const customer = this.db.customers.get(paymentIntent.customerId);
            return {
                message: 'Payment Intent sudah berhasil lunas sebelumnya.',
                paymentIntent,
                invoice,
                customerPoints: customer?.poinKoinKelontong,
            };
        }
        for (const item of invoice.items) {
            const product = this.db.products.get(item.productId);
            if (product) {
                product.stock = Math.max(0, product.stock - item.quantity);
                this.db.products.set(product.id, product);
            }
        }
        paymentIntent.status = 'succeeded';
        paymentIntent.paymentMethod = dto.paymentMethod || paymentIntent.paymentMethod;
        paymentIntent.idempotencyKey = idempotencyKey;
        paymentIntent.confirmedAt = new Date();
        this.db.paymentIntents.set(paymentIntent.id, paymentIntent);
        invoice.status = 'PAID';
        this.db.invoices.set(invoice.id, invoice);
        const customer = this.db.customers.get(paymentIntent.customerId);
        const poinBonus = 200;
        if (customer) {
            customer.poinKoinKelontong += poinBonus;
            this.db.customers.set(customer.id, customer);
        }
        return {
            message: 'Pembayaran berhasil dikonfirmasi dan dicatat lunas!',
            idempotencyKeyUsed: idempotencyKey,
            paymentIntent,
            invoice,
            customerReward: {
                customerId: customer?.id,
                customerName: customer?.name,
                poinBonusAwarded: poinBonus,
                totalPoinSekarang: customer?.poinKoinKelontong,
            },
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_db_service_1.InMemoryDbService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map