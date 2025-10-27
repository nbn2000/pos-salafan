// src/product/product-batch/services/product-batch-find-by-product.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { ProductBatchResult, toBatchResult } from '../helper';
import { ProductBatchBaseService } from './product-batch-base.service';

@Injectable()
export class ProductBatchFindByProductService extends ProductBatchBaseService {
  // 🔹 Paginated
  async findByProductPaginated(
    productId: string,
    query: PaginationQueryDto,
  ): Promise<PaginationResult<ProductBatchResult>> {
    const page = await paginateAndFilter(this.batchRepo, query, {
      productId,
      isActive: true,
    });
    return { ...page, results: page.results.map(toBatchResult) };
  }

  // 🔹 "All" (kept identical to original which still used pagination util)
  async findByProductAll(
    productId: string,
    query: PaginationQueryDto,
  ): Promise<PaginationResult<ProductBatchResult>> {
    const page = await paginateAndFilter(this.batchRepo, query, {
      productId,
      isActive: true,
    });
    return { ...page, results: page.results.map(toBatchResult) };
  }
}
