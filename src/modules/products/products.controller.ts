import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Products (Katalog Sembako SRC)')
@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Katalog produk & sembako Toko SRC',
    description: 'Melihat stok dan harga produk kelontong dengan pagination dan filter.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Katalog produk berhasil diambil.',
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail produk sembako berdasarkan ID',
    description: 'Melihat harga dan sisa stok fisik suatu barang di toko.',
  })
  @ApiParam({ name: 'id', example: 'prod_beras_5kg', description: 'ID produk Toko SRC' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detail produk ditemukan.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'RFC 7807 Problem Details jika ID produk tidak ditemukan.',
  })
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }
}
