// src/supplier/services/supplier-find-all.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { SupplierResult, toSupplierResult } from '../helper';

@Injectable()
export class SupplierFindAllService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<SupplierResult>> {
    const data = await paginateAndFilter(this.repo, query, { isActive: true });
    return { ...data, results: data.results.map(toSupplierResult) };
  }
}
