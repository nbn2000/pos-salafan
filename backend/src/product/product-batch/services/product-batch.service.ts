// src/product/product-batch/services/product-batch.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/common/utils/pagination.util';

import { CreateProductBatchDto } from '../dto/create-product-batch.dto';
import { UpdateProductBatchDto } from '../dto/update-product-batch.dto';
import { ProductBatch } from '../entities/product-batch.entity';
import { ProductBatchResult } from '../helper';

import { ProductBatchCreateService } from './product-batch-create.service';
import { ProductBatchFindAllService } from './product-batch-find-all.service';
import { ProductBatchFindByProductService } from './product-batch-find-by-product.service';
import { ProductBatchFindOneService } from './product-batch-find-one.service';
import { ProductBatchRemoveService } from './product-batch-remove.service';
import { ProductBatchUpdateService } from './product-batch-update.service';

@Injectable()
export class ProductBatchService {
  constructor(
    private readonly creator: ProductBatchCreateService,
    private readonly finderAll: ProductBatchFindAllService,
    private readonly finderOne: ProductBatchFindOneService,
    private readonly updater: ProductBatchUpdateService,
    private readonly remover: ProductBatchRemoveService,
    private readonly byProduct: ProductBatchFindByProductService,
  ) {}

  // ---------- API (facade) ----------

  create(dto: CreateProductBatchDto): Promise<ProductBatch> {
    return this.creator.create(dto);
  }

  findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<ProductBatchResult>> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<ProductBatchResult> {
    return this.finderOne.findOne(id);
  }

  update(id: string, dto: UpdateProductBatchDto): Promise<ProductBatch> {
    return this.updater.update(id, dto);
  }

  remove(id: string): Promise<ProductBatch> {
    return this.remover.remove(id);
  }

  // Extra endpoints
  findByProductPaginated(
    productId: string,
    query: PaginationQueryDto,
  ): Promise<PaginationResult<ProductBatchResult>> {
    return this.byProduct.findByProductPaginated(productId, query);
  }

  findByProductAll(
    productId: string,
    query: PaginationQueryDto,
  ): Promise<PaginationResult<ProductBatchResult>> {
    return this.byProduct.findByProductAll(productId, query);
  }
}
