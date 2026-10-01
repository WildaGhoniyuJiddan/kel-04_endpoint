import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Invoices (Nota Belanja Kasir Toko SRC)')
@Controller('v1/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Daftar semua invoice / nota belanja kasir',
    description:
      'Mendukung Pagination, Filter Status (?status=UNPAID atau ?status=PAID), Pencarian, dan Sorting.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daftar invoice nota belanja berhasil diambil.',
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.invoicesService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Buat invoice nota belanja baru di kasir Toko SRC',
    description:
      'Mencatat pembelian barang sembako, menghitung total belanja, dan menghasilkan Payment Intent untuk dibayar.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invoice belanja berhasil dibuat.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'RFC 7807 jika stok barang tidak mencukupi atau format salah.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RFC 7807 jika pelanggan atau produk tidak ditemukan.',
  })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail invoice nota belanja berdasarkan ID',
    description: 'Melihat rincian barang belanjaan dan status pelunasan nota.',
  })
  @ApiParam({ name: 'id', example: 'INV-SRC-1001', description: 'ID Invoice Toko SRC' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detail nota belanja ditemukan.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RFC 7807 jika nota belanja tidak ditemukan.',
  })
  findById(@Param('id') id: string) {
    return this.invoicesService.findById(id);
  }
}
