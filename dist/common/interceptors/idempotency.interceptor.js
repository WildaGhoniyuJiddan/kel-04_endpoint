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
exports.IdempotencyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const crypto = require("crypto");
const in_memory_db_service_1 = require("../../database/in-memory-db.service");
let IdempotencyInterceptor = class IdempotencyInterceptor {
    db;
    constructor(db) {
        this.db = db;
    }
    intercept(context, next) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const idempotencyKey = (req.headers['idempotency-key'] ||
            req.headers['x-idempotency-key']);
        if (!idempotencyKey) {
            throw new common_1.BadRequestException({
                type: 'https://api.example.com/errors/parameter-missing',
                error: 'Bad Request',
                code: 'parameter_missing',
                message: 'Header "Idempotency-Key" wajib disertakan untuk operasi POST kritikal ini!',
                param: 'Idempotency-Key',
            });
        }
        const payloadString = JSON.stringify(req.body || {});
        const requestHash = crypto
            .createHash('sha256')
            .update(`${req.method}:${req.originalUrl}:${payloadString}`)
            .digest('hex');
        const existingRecord = this.db.idempotencyRecords.get(idempotencyKey);
        if (existingRecord) {
            if (existingRecord.status === 'IN_PROGRESS') {
                throw new common_1.ConflictException({
                    type: 'https://api.example.com/errors/idempotency-conflict',
                    error: 'Conflict (Idempotency In Progress)',
                    code: 'idempotency_request_in_progress',
                    message: 'Operasi dengan Idempotency-Key ini sedang dalam proses. Silakan coba sesaat lagi.',
                    param: 'Idempotency-Key',
                    idempotencyKey,
                });
            }
            if (existingRecord.requestHash !== requestHash) {
                throw new common_1.ConflictException({
                    type: 'https://api.example.com/errors/idempotency-conflict',
                    error: 'Conflict (Idempotency Error)',
                    code: 'idempotency_key_reused_with_different_body',
                    message: 'Kunci idempotency sudah pernah dipakai sebelumnya dengan body request berbeda! Request ditolak dengan kode 409.',
                    param: 'Idempotency-Key',
                    idempotencyKey,
                });
            }
            res.setHeader('Idempotent-Replay', 'true');
            res.setHeader('X-Cache-Lookup', 'HIT');
            res.status(existingRecord.responseStatus || 200);
            return (0, rxjs_1.of)(existingRecord.responseBody);
        }
        this.db.idempotencyRecords.set(idempotencyKey, {
            key: idempotencyKey,
            requestHash,
            status: 'IN_PROGRESS',
            createdAt: new Date(),
        });
        return next.handle().pipe((0, operators_1.tap)((data) => {
            const statusCode = res.statusCode || 200;
            this.db.idempotencyRecords.set(idempotencyKey, {
                key: idempotencyKey,
                requestHash,
                status: 'RESOLVED',
                responseStatus: statusCode,
                responseBody: data,
                createdAt: new Date(),
            });
            res.setHeader('Idempotent-Replay', 'false');
            res.setHeader('X-Cache-Lookup', 'MISS');
        }));
    }
};
exports.IdempotencyInterceptor = IdempotencyInterceptor;
exports.IdempotencyInterceptor = IdempotencyInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_db_service_1.InMemoryDbService])
], IdempotencyInterceptor);
//# sourceMappingURL=idempotency.interceptor.js.map