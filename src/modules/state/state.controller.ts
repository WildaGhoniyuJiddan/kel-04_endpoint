import { Controller, Get, Post, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InMemoryDbService } from '../../database/in-memory-db.service';

@ApiTags('System State & Testing')
@Controller('v1/state')
export class StateController {
  constructor(private readonly db: InMemoryDbService) {}

  @Get()
  @ApiOperation({
    summary: 'Lihat status database memori saat ini',
    description:
      'Memeriksa seluruh data customer, produk sembako, invoice belanja, payment intents, dan rekaman cache idempotensi.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ringkasan data in-memory berhasil diambil.',
  })
  getState() {
    return {
      message: 'Status Database In-Memory Toko SRC Saat Ini',
      summary: this.db.getStateSummary(),
      customers: Array.from(this.db.customers.values()),
      products: Array.from(this.db.products.values()),
      invoices: Array.from(this.db.invoices.values()),
      paymentIntents: Array.from(this.db.paymentIntents.values()),
      idempotencyRecords: Array.from(this.db.idempotencyRecords.values()),
    };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset database toko SRC ke data awal (Seed Data)',
    description:
      'Mengembalikan stok sembako, mereset status invoice, saldo poin, dan membersihkan seluruh cache idempotensi untuk uji coba ulang.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Database berhasil di-reset ke kondisi awal.',
  })
  resetState() {
    this.db.reset();
    return {
      message: 'Database Toko SRC berhasil di-reset ke data awal (Seed Data).',
      summary: this.db.getStateSummary(),
    };
  }
}
