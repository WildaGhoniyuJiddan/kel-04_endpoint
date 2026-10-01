import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';

export function UseIdempotency() {
  return applyDecorators(UseInterceptors(IdempotencyInterceptor));
}
