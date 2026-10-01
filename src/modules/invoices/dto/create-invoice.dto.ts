import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty({
    example: 'prod_minyak_2l',
    description: 'ID produk yang dibeli',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 1,
    description: 'Jumlah kuantitas barang yang dibeli',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateInvoiceDto {
  @ApiProperty({
    example: 'cust_src_01',
    description: 'ID member pelanggan Toko SRC yang berbelanja',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    type: [InvoiceItemDto],
    description: 'Daftar barang belanjaan di kasir',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
