"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
let ApiKeyGuard = class ApiKeyGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new common_1.UnauthorizedException({
                type: 'https://api.example.com/errors/unauthorized',
                error: 'Unauthorized',
                code: 'unauthorized',
                message: 'Header "Authorization: Bearer <API_KEY>" wajib disertakan untuk mengakses endpoint ini!',
                param: 'Authorization',
            });
        }
        if (!authHeader.startsWith('Bearer sk_src_')) {
            throw new common_1.UnauthorizedException({
                type: 'https://api.example.com/errors/unauthorized',
                error: 'Unauthorized',
                code: 'invalid_api_key',
                message: 'API Key tidak valid! Gunakan token dengan format: Bearer sk_src_test123',
                param: 'Authorization',
            });
        }
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = __decorate([
    (0, common_1.Injectable)()
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map