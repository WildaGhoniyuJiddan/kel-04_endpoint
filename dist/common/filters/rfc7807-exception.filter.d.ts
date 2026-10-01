import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class Rfc7807ExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
    private getDefaultTitleForStatus;
    private getDefaultCodeForStatus;
}
