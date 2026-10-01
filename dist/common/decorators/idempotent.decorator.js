"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseIdempotency = UseIdempotency;
const common_1 = require("@nestjs/common");
const idempotency_interceptor_1 = require("../interceptors/idempotency.interceptor");
function UseIdempotency() {
    return (0, common_1.applyDecorators)((0, common_1.UseInterceptors)(idempotency_interceptor_1.IdempotencyInterceptor));
}
//# sourceMappingURL=idempotent.decorator.js.map