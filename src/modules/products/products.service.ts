import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService, Product } from '../../database/in-memory-db.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll(query: PaginationQueryDto) {
    let items = Array.from(this.db.products.values());

    // Filter Search
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.id.toLowerCase().includes(s),
      );
    }

    // Sorting
    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA > valB) return sortOrder;
      if (valA < valB) return -sortOrder;
      return 0;
    });

    // Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  findById(id: string): Product {
    const product = this.db.products.get(id);
    if (!product) {
      throw new NotFoundException({
        type: 'https://api.example.com/errors/resource-missing',
        error: 'Not Found',
        code: 'resource_missing',
        message: `Produk sembako dengan ID "${id}" tidak ditemukan di Toko SRC.`,
        param: 'id',
      });
    }
    return product;
  }
}
