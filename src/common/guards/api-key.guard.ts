import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Guard sederhana untuk validasi API Key / Bearer Token.
 * Mensimulasikan autentikasi Stripe / Midtrans API Key.
 * Format valid: Bearer sk_src_test...
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException({
        type: 'https://api.example.com/errors/unauthorized',
        error: 'Unauthorized',
        code: 'unauthorized',
        message: 'Header "Authorization: Bearer <API_KEY>" wajib disertakan untuk mengakses endpoint ini!',
        param: 'Authorization',
      });
    }

    if (!authHeader.startsWith('Bearer sk_src_')) {
      throw new UnauthorizedException({
        type: 'https://api.example.com/errors/unauthorized',
        error: 'Unauthorized',
        code: 'invalid_api_key',
        message: 'API Key tidak valid! Gunakan token dengan format: Bearer sk_src_test123',
        param: 'Authorization',
      });
    }

    return true;
  }
}
