"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rfc7807ExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let Rfc7807ExceptionFilter = class Rfc7807ExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let title = 'Internal Server Error';
        let detail = 'Terjadi kesalahan sistem internal pada server.';
        let type = 'https://tools.ietf.org/html/rfc9110#section-15.6.1';
        let code = 'api_error';
        let param = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                detail = res;
            }
            else if (typeof res === 'object' && res !== null) {
                const errorObj = res;
                detail = Array.isArray(errorObj.message)
                    ? errorObj.message.join(', ')
                    : errorObj.message || errorObj.detail || detail;
                title = errorObj.error || this.getDefaultTitleForStatus(status);
                code = errorObj.code || this.getDefaultCodeForStatus(status);
                param = errorObj.param;
                if (errorObj.type) {
                    type = errorObj.type;
                }
            }
        }
        else if (exception instanceof Error) {
            detail = exception.message;
        }
        const problemDetails = {
            type: type || `https://httpstatuses.com/${status}`,
            title: title || this.getDefaultTitleForStatus(status),
            status,
            detail,
            instance: request.originalUrl || request.url,
            code,
            ...(param ? { param } : {}),
            timestamp: new Date().toISOString(),
        };
        response.setHeader('Content-Type', 'application/problem+json');
        response.status(status).json(problemDetails);
    }
    getDefaultTitleForStatus(status) {
        switch (status) {
            case 400:
                return 'Bad Request';
            case 401:
                return 'Unauthorized';
            case 403:
                return 'Forbidden';
            case 404:
                return 'Not Found';
            case 409:
                return 'Conflict (Idempotency Error)';
            case 422:
                return 'Unprocessable Entity';
            default:
                return 'HTTP Error';
        }
    }
    getDefaultCodeForStatus(status) {
        switch (status) {
            case 400:
                return 'parameter_invalid';
            case 401:
                return 'unauthorized';
            case 403:
                return 'forbidden';
            case 404:
                return 'resource_missing';
            case 409:
                return 'idempotency_conflict';
            case 422:
                return 'unprocessable_entity';
            default:
                return 'api_error';
        }
    }
};
exports.Rfc7807ExceptionFilter = Rfc7807ExceptionFilter;
exports.Rfc7807ExceptionFilter = Rfc7807ExceptionFilter = __decorate([
    (0, common_1.Catch)()
], Rfc7807ExceptionFilter);
//# sourceMappingURL=rfc7807-exception.filter.js.map