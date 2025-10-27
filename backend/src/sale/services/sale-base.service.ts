import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { Product } from 'src/product/product/entities/product.entity';

@Injectable()
export class SaleBaseService {
  constructor(
    @InjectRepository(Product)
    protected readonly productRepo: Repository<Product>,
    @InjectRepository(ProductBatch)
    protected readonly productBatchRepo: Repository<ProductBatch>,
  ) {}

  protected async loadActiveProductBatches(productIds: string[]) {
    if (!productIds.length) return [];
    return this.productBatchRepo.find({
      where: { isActive: true, productId: In(productIds) },
      order: { createdAt: 'DESC' },
    });
  }
}
