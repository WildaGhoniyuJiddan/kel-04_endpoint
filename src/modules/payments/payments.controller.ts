import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentIntentDto } from './dto/confirm-payment-intent.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UseIdempotency } from '../../common/decorators/idempotent.decorator';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Payment Intents (Stripe / Midtrans Pattern)')
@Controller('v1/payment_intents')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Daftar semua Payment Intents',
    description:
      'Mendukung Pagination, Filter Status (?status=requires_confirmation atau ?status=succeeded), dan Sorting.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daftar payment intents berhasil diambil.',
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Buat Payment Intent baru dari Invoice',
    description: 'Menginisiasi niat pembayaran tagihan kasir belanja Toko SRC.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment Intent berhasil dibuat.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RFC 7807 jika Invoice ID tidak ditemukan.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'RFC 7807 jika Invoice sudah lunas sebelumnya.',
  })
  create(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail Payment Intent berdasarkan ID',
    description: 'Melihat status transaksi, metode bayar, dan nominal tagihan.',
  })
  @ApiParam({ name: 'id', example: 'pi_src_1001', description: 'ID Payment Intent' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detail payment intent ditemukan.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RFC 7807 jika ID Payment Intent tidak ditemukan.',
  })
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  /**
   * ENDPOINT KRITIKAL DENGAN IDEMPOTENCY-KEY
   * POST /v1/payment_intents/:id/confirm
   */
  @Post(':id/confirm')
  @UseIdempotency()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Konfirmasi pelunasan Payment Intent (POST KRITIKAL IDEMPOTEN)',
    description:
      'Wajib menyertakan HTTP Header "Idempotency-Key: <UUID>". Mengupdate invoice jadi PAID, memotong stok sembako, dan memberi koin reward ke pelanggan. Jika di-retry dengan key sama, hasil di-replay tanpa memotong stok atau memberi poin ganda!',
  })
  @ApiParam({ name: 'id', example: 'pi_src_1001', description: 'ID Payment Intent yang dikonfirmasi' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'UUID v4 unik transaksi idempotensi (contoh: 7d6c5b4a-3210-4f9e-8abc-123456789abc)',
    required: true,
    example: '7d6c5b4a-3210-4f9e-8abc-123456789abc',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Pembayaran berhasil dikonfirmasi. Header "Idempotent-Replay" bernilai true jika ini adalah hasil replay dari request retry.',
    headers: {
      'Idempotent-Replay': {
        description: 'true jika respon diambil dari cache eksekusi pertama',
        schema: { type: 'string', example: 'true' },
      },
      'X-Cache-Lookup': {
        description: 'HIT jika idempotent replay, MISS jika panggilan pertama',
        schema: { type: 'string', example: 'HIT' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'RFC 7807 (400): Header "Idempotency-Key" tidak disertakan.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RFC 7807 (404): Payment Intent atau Invoice tidak ditemukan.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'RFC 7807 (409): Idempotency key sudah pernah dipakai dengan isi payload/body yang berbeda, atau transaksi sedang diproses.',
  })
  confirm(
    @Param('id') id: string,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() dto: ConfirmPaymentIntentDto,
  ) {
    return this.paymentsService.confirm(id, dto, idempotencyKey);
  }

  /**
   * ENDPOINT TESTING AUTHENTICATION (401 UNAUTHORIZED SCENARIO)
   * GET /v1/payment_intents/:id/secure-check
   */
  @Get(':id/secure-check')
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({
    summary: 'Endpoint pengujian keamanan & RFC 7807 401 Unauthorized',
    description:
      'Mensimulasikan verifikasi API Key (Bearer sk_src_test123). Jika token salah atau tidak dikirim, server mengembalikan respon 401 sesuai RFC 7807.',
  })
  @ApiParam({ name: 'id', example: 'pi_src_1001' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token valid, detail transaksi rahasia berhasil diakses.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'RFC 7807 (401): Header Authorization hilang atau token tidak valid.',
  })
  secureCheck(@Param('id') id: string) {
    const payment = this.paymentsService.findById(id);
    return {
      message: 'Akses terautentikasi berhasil menggunakan API Key.',
      payment,
    };
  }
}
