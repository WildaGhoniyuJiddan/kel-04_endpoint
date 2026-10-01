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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Customers (Member Toko SRC)')
@Controller('v1/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({
    summary: 'Daftar semua member pelanggan Toko SRC',
    description:
      'Mendukung Pagination (?page=1&limit=10), Pencarian (?search=siti), dan Sorting (?sortBy=name&sortOrder=asc).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daftar pelanggan berhasil diambil beserta metadata pagination.',
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.customersService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrasi member pelanggan Toko SRC baru',
    description: 'Menambahkan data member pelanggan baru dengan poin awal 0.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Member pelanggan berhasil didaftarkan.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'RFC 7807 Problem Details jika parameter wajib tidak valid.',
  })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail member pelanggan berdasarkan ID',
    description: 'Melihat profil pelanggan, kontak, dan akumulasi poin reward belanja.',
  })
  @ApiParam({ name: 'id', example: 'cust_src_01', description: 'ID unik member Toko SRC' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detail data member pelanggan ditemukan.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RFC 7807 Problem Details jika ID pelanggan tidak terdaftar.',
  })
  findById(@Param('id') id: string) {
    return this.customersService.findById(id);
  }
}
