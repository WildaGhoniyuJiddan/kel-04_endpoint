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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_intent_dto_1 = require("./dto/create-payment-intent.dto");
const confirm_payment_intent_dto_1 = require("./dto/confirm-payment-intent.dto");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const idempotent_decorator_1 = require("../../common/decorators/idempotent.decorator");
const api_key_guard_1 = require("../../common/guards/api-key.guard");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    findAll(query) {
        return this.paymentsService.findAll(query);
    }
    create(dto) {
        return this.paymentsService.create(dto);
    }
    findById(id) {
        return this.paymentsService.findById(id);
    }
    confirm(id, idempotencyKey, dto) {
        return this.paymentsService.confirm(id, dto, idempotencyKey);
    }
    secureCheck(id) {
        const payment = this.paymentsService.findById(id);
        return {
            message: 'Akses terautentikasi berhasil menggunakan API Key.',
            payment,
        };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Daftar semua Payment Intents',
        description: 'Mendukung Pagination, Filter Status (?status=requires_confirmation atau ?status=succeeded), dan Sorting.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Daftar payment intents berhasil diambil.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Buat Payment Intent baru dari Invoice',
        description: 'Menginisiasi niat pembayaran tagihan kasir belanja Toko SRC.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Payment Intent berhasil dibuat.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'RFC 7807 jika Invoice ID tidak ditemukan.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'RFC 7807 jika Invoice sudah lunas sebelumnya.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Detail Payment Intent berdasarkan ID',
        description: 'Melihat status transaksi, metode bayar, dan nominal tagihan.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 'pi_src_1001', description: 'ID Payment Intent' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Detail payment intent ditemukan.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'RFC 7807 jika ID Payment Intent tidak ditemukan.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, idempotent_decorator_1.UseIdempotency)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Konfirmasi pelunasan Payment Intent (POST KRITIKAL IDEMPOTEN)',
        description: 'Wajib menyertakan HTTP Header "Idempotency-Key: <UUID>". Mengupdate invoice jadi PAID, memotong stok sembako, dan memberi koin reward ke pelanggan. Jika di-retry dengan key sama, hasil di-replay tanpa memotong stok atau memberi poin ganda!',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 'pi_src_1001', description: 'ID Payment Intent yang dikonfirmasi' }),
    (0, swagger_1.ApiHeader)({
        name: 'Idempotency-Key',
        description: 'UUID v4 unik transaksi idempotensi (contoh: 7d6c5b4a-3210-4f9e-8abc-123456789abc)',
        required: true,
        example: '7d6c5b4a-3210-4f9e-8abc-123456789abc',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Pembayaran berhasil dikonfirmasi. Header "Idempotent-Replay" bernilai true jika ini adalah hasil replay dari request retry.',
        headers: {
            'Idempotent-Replay': {
                description: 'true jika respon diambil dari cache eksekusi pertama',
                schema: { type: 'string', example: 'true' },
            },
            'X-Cache-Lookup': {
                description: 'HIT jika idempotent replay, MISS jika panggilan pertama',
                schema: { type: 'string', example: 'HIT' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'RFC 7807 (400): Header "Idempotency-Key" tidak disertakan.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'RFC 7807 (404): Payment Intent atau Invoice tidak ditemukan.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'RFC 7807 (409): Idempotency key sudah pernah dipakai dengan isi payload/body yang berbeda, atau transaksi sedang diproses.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('idempotency-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, confirm_payment_intent_dto_1.ConfirmPaymentIntentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Get)(':id/secure-check'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Endpoint pengujian keamanan & RFC 7807 401 Unauthorized',
        description: 'Mensimulasikan verifikasi API Key (Bearer sk_src_test123). Jika token salah atau tidak dikirim, server mengembalikan respon 401 sesuai RFC 7807.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 'pi_src_1001' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Token valid, detail transaksi rahasia berhasil diakses.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'RFC 7807 (401): Header Authorization hilang atau token tidak valid.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "secureCheck", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payment Intents (Stripe / Midtrans Pattern)'),
    (0, common_1.Controller)('v1/payment_intents'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map