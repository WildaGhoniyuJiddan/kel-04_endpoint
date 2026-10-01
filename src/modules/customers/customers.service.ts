import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InMemoryDbService, Customer } from '../../database/in-memory-db.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll(query: PaginationQueryDto) {
    let items = Array.from(this.db.customers.values());

    // 1. Filter Search (Nama atau Email)
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.id.toLowerCase().includes(s),
      );
    }

    // 2. Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA > valB) return sortOrder;
      if (valA < valB) return -sortOrder;
      return 0;
    });

    // 3. Pagination
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

  findById(id: string): Customer {
    const customer = this.db.customers.get(id);
    if (!customer) {
      throw new NotFoundException({
        type: 'https://api.example.com/errors/resource-missing',
        error: 'Not Found',
        code: 'resource_missing',
        message: `Pelanggan Toko SRC dengan ID "${id}" tidak ditemukan.`,
        param: 'id',
      });
    }
    return customer;
  }

  create(dto: CreateCustomerDto): Customer {
    const newId = `cust_src_${uuidv4().substring(0, 6)}`;
    const newCustomer: Customer = {
      id: newId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone || '-',
      poinKoinKelontong: 0,
      createdAt: new Date(),
    };

    this.db.customers.set(newId, newCustomer);
    return newCustomer;
  }
}
