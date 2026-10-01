import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filter global untuk memformat seluruh error ke spesifikasi standar industri:
 * RFC 7807 / RFC 9457 (Problem Details for HTTP APIs)
 * Content-Type: application/problem+json
 */
@Catch()
export class Rfc7807ExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'Terjadi kesalahan sistem internal pada server.';
    let type = 'https://tools.ietf.org/html/rfc9110#section-15.6.1';
    let code = 'api_error';
    let param: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        detail = res;
      } else if (typeof res === 'object' && res !== null) {
        const errorObj = res as Record<string, any>;
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
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    // RFC 7807 Standard Problem Details
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

  private getDefaultTitleForStatus(status: number): string {
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

  private getDefaultCodeForStatus(status: number): string {
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
}
