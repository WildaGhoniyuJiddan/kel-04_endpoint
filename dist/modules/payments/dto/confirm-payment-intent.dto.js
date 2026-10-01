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
exports.ConfirmPaymentIntentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ConfirmPaymentIntentDto {
    paymentMethod = 'qris';
    amountPaid;
    notes;
}
exports.ConfirmPaymentIntentDto = ConfirmPaymentIntentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'qris',
        enum: ['qris', 'cash', 'bank_transfer'],
        description: 'Metode pembayaran final yang dikonfirmasi kasir',
        default: 'qris',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['qris', 'cash', 'bank_transfer']),
    __metadata("design:type", String)
], ConfirmPaymentIntentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 73000,
        description: 'Nominal pembayaran yang diterima kasir',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ConfirmPaymentIntentDto.prototype, "amountPaid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Lunas via QRIS Toko SRC',
        description: 'Catatan kasir / referensi transaksi',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentIntentDto.prototype, "notes", void 0);
//# sourceMappingURL=confirm-payment-intent.dto.js.map