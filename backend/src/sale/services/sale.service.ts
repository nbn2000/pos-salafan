import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { Product } from 'src/product/product/entities/product.entity';

import { PagedResult, PaginationQuery, SaleItem } from '../helper';
import { SaleBaseService } from './sale-base.service';
import { SaleFindAllService } from './sale-find-all.service';
import { SaleFindOneService } from './sale-find-one.service';

@Injectable()
export class SaleService extends SaleBaseService {
  constructor(
    @InjectRepository(Product) productRepo: Repository<Product>,
    @InjectRepository(ProductBatch)
    productBatchRepo: Repository<ProductBatch>,

    private readonly finderAll: SaleFindAllService,
    private readonly finderOneSvc: SaleFindOneService,
  ) {
    super(productRepo, productBatchRepo);
  }

  findAll(query: PaginationQuery): Promise<PagedResult<SaleItem>> {
    return this.finderAll.findAll(query);
  }

  findOne(params: { productId: string; includeBatches?: boolean | string }) {
    return this.finderOneSvc.findOne(params);
  }
}
