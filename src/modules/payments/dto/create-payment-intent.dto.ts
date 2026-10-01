import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({
    example: 'INV-SRC-1001',
    description: 'ID Invoice nota belanja yang hendak dibayarkan',
  })
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @ApiPropertyOptional({
    example: 'qris',
    enum: ['qris', 'cash', 'bank_transfer'],
    default: 'qris',
    description: 'Metode pembayaran ritel yang dipilih di kasir',
  })
  @IsOptional()
  @IsIn(['qris', 'cash', 'bank_transfer'])
  paymentMethod?: 'qris' | 'cash' | 'bank_transfer' = 'qris';
}
