import { IsOptional, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentIntentDto {
  @ApiPropertyOptional({
    example: 'qris',
    enum: ['qris', 'cash', 'bank_transfer'],
    description: 'Metode pembayaran final yang dikonfirmasi kasir',
    default: 'qris',
  })
  @IsOptional()
  @IsIn(['qris', 'cash', 'bank_transfer'])
  paymentMethod?: 'qris' | 'cash' | 'bank_transfer' = 'qris';

  @ApiPropertyOptional({
    example: 73000,
    description: 'Nominal pembayaran yang diterima kasir',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @ApiPropertyOptional({
    example: 'Lunas via QRIS Toko SRC',
    description: 'Catatan kasir / referensi transaksi',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
