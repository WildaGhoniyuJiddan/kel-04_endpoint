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
exports.StateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const in_memory_db_service_1 = require("../../database/in-memory-db.service");
let StateController = class StateController {
    db;
    constructor(db) {
        this.db = db;
    }
    getState() {
        return {
            message: 'Status Database In-Memory Toko SRC Saat Ini',
            summary: this.db.getStateSummary(),
            customers: Array.from(this.db.customers.values()),
            products: Array.from(this.db.products.values()),
            invoices: Array.from(this.db.invoices.values()),
            paymentIntents: Array.from(this.db.paymentIntents.values()),
            idempotencyRecords: Array.from(this.db.idempotencyRecords.values()),
        };
    }
    resetState() {
        this.db.reset();
        return {
            message: 'Database Toko SRC berhasil di-reset ke data awal (Seed Data).',
            summary: this.db.getStateSummary(),
        };
    }
};
exports.StateController = StateController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lihat status database memori saat ini',
        description: 'Memeriksa seluruh data customer, produk sembako, invoice belanja, payment intents, dan rekaman cache idempotensi.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Ringkasan data in-memory berhasil diambil.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StateController.prototype, "getState", null);
__decorate([
    (0, common_1.Post)('reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset database toko SRC ke data awal (Seed Data)',
        description: 'Mengembalikan stok sembako, mereset status invoice, saldo poin, dan membersihkan seluruh cache idempotensi untuk uji coba ulang.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Database berhasil di-reset ke kondisi awal.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StateController.prototype, "resetState", null);
exports.StateController = StateController = __decorate([
    (0, swagger_1.ApiTags)('System State & Testing'),
    (0, common_1.Controller)('v1/state'),
    __metadata("design:paramtypes", [in_memory_db_service_1.InMemoryDbService])
], StateController);
//# sourceMappingURL=state.controller.js.map