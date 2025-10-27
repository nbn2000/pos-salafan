// src/product/product-batch/services/product-batch-find-all.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { ProductBatchResult, toBatchResult } from '../helper';
import { ProductBatchBaseService } from './product-batch-base.service';

@Injectable()
export class ProductBatchFindAllService extends ProductBatchBaseService {
  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<ProductBatchResult>> {
    const data = await paginateAndFilter(this.batchRepo, query, {
      isActive: true,
    });
    return { ...data, results: data.results.map(toBatchResult) };
  }
}
