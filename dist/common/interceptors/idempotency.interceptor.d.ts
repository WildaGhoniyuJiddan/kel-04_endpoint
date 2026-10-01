import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InMemoryDbService } from '../../database/in-memory-db.service';
export declare class IdempotencyInterceptor implements NestInterceptor {
    private readonly db;
    constructor(db: InMemoryDbService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
