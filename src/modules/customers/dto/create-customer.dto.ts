import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Bu Siti Rahayu',
    description: 'Nama lengkap pelanggan / member Toko SRC',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'siti.rahayu@src-kelontong.id',
    description: 'Alamat email aktif pelanggan',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    example: '081234567890',
    description: 'Nomor telepon WhatsApp pelanggan untuk notifikasi struk',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
