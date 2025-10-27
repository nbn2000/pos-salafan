// src/product/product-batch/services/product-batch-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductLog } from 'src/product/product-log/entities/product-log.entity';
import { Product } from 'src/product/product/entities/product.entity';
import { ProductBatch } from '../entities/product-batch.entity';

@Injectable()
export class ProductBatchBaseService {
  constructor(
    @InjectRepository(ProductBatch)
    protected readonly batchRepo: Repository<ProductBatch>,
    @InjectRepository(Product)
    protected readonly productRepo: Repository<Product>,
    @InjectRepository(ProductLog)
    protected readonly productLogRepo: Repository<ProductLog>,
  ) {}

  protected async getActiveBatchOrThrow(id: string): Promise<ProductBatch> {
    const batch = await this.batchRepo.findOne({
      where: { id, isActive: true },
    });
    if (!batch) throw new NotFoundException('Mahsulot partiyasi topilmadi');
    return batch;
  }
}

