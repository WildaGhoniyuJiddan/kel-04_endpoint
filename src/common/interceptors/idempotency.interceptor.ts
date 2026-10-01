import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { InMemoryDbService } from '../../database/in-memory-db.service';

/**
 * Interceptor Idempotensi ala Stripe:
 * - Menangkap header Idempotency-Key
 * - Melakukan hashing SHA-256 terhadap Method + Path + Body
 * - Mencegah eksekusi ganda dan mengembalikan respon replay (HTTP 200/201 + Idempotent-Replay: true)
 * - Menolak pemakaian key yang sama dengan payload berbeda (HTTP 409 Conflict)
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly db: InMemoryDbService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const idempotencyKey = (
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key']
    ) as string;

    // 1. Validasi Keberadaan Header Idempotency-Key
    if (!idempotencyKey) {
      throw new BadRequestException({
        type: 'https://api.example.com/errors/parameter-missing',
        error: 'Bad Request',
        code: 'parameter_missing',
        message: 'Header "Idempotency-Key" wajib disertakan untuk operasi POST kritikal ini!',
        param: 'Idempotency-Key',
      });
    }

    // 2. Hash Request Payload (SHA-256)
    const payloadString = JSON.stringify(req.body || {});
    const requestHash = crypto
      .createHash('sha256')
      .update(`${req.method}:${req.originalUrl}:${payloadString}`)
      .digest('hex');

    const existingRecord = this.db.idempotencyRecords.get(idempotencyKey);

    if (existingRecord) {
      // Kasus A: Request sedang berlangsung (Concurrent / Race condition)
      if (existingRecord.status === 'IN_PROGRESS') {
        throw new ConflictException({
          type: 'https://api.example.com/errors/idempotency-conflict',
          error: 'Conflict (Idempotency In Progress)',
          code: 'idempotency_request_in_progress',
          message: 'Operasi dengan Idempotency-Key ini sedang dalam proses. Silakan coba sesaat lagi.',
          param: 'Idempotency-Key',
          idempotencyKey,
        });
      }

      // Kasus B: Key sama digunakan dengan body/payload BERBEDA (RFC 7807 & Slide 14)
      if (existingRecord.requestHash !== requestHash) {
        throw new ConflictException({
          type: 'https://api.example.com/errors/idempotency-conflict',
          error: 'Conflict (Idempotency Error)',
          code: 'idempotency_key_reused_with_different_body',
          message: 'Kunci idempotency sudah pernah dipakai sebelumnya dengan body request berbeda! Request ditolak dengan kode 409.',
          param: 'Idempotency-Key',
          idempotencyKey,
        });
      }

      // Kasus C: Idempotent Replay (Kunci sama & Payload sama)
      res.setHeader('Idempotent-Replay', 'true');
      res.setHeader('X-Cache-Lookup', 'HIT');
      res.status(existingRecord.responseStatus || 200);

      return of(existingRecord.responseBody);
    }

    // 3. Catat status awal IN_PROGRESS
    this.db.idempotencyRecords.set(idempotencyKey, {
      key: idempotencyKey,
      requestHash,
      status: 'IN_PROGRESS',
      createdAt: new Date(),
    });

    // 4. Eksekusi handler asli dan simpan hasil (RESOLVED)
    return next.handle().pipe(
      tap((data) => {
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
      }),
    );
  }
}
