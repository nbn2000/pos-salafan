// src/product/product-log/services/product-log-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductLog } from '../entities/product-log.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductBatch } from '../../product-batch/entities/product-batch.entity';

@Injectable()
export class ProductLogBaseService {
  constructor(
    @InjectRepository(ProductLog)
    protected readonly logRepo: Repository<ProductLog>,
    @InjectRepository(Product)
    protected readonly productRepo: Repository<Product>,
    @InjectRepository(ProductBatch)
    protected readonly batchRepo: Repository<ProductBatch>,
  ) {}

  protected async getActiveLogOrThrow(id: string): Promise<ProductLog> {
    const log = await this.logRepo.findOne({
      where: { id, isActive: true },
      relations: ['product', 'productBatch'],
    });
    if (!log) throw new NotFoundException('Mahsulot logi topilmadi');
    return log;
  }

  /** Load logs with relations (including soft-deleted) and return map by id */
  protected async hydrateWithRelations(
    ids: string[],
  ): Promise<Map<string, ProductLog>> {
    if (!ids.length) return new Map();
    const logs = await this.logRepo.find({ where: { id: In(ids) }, withDeleted: true });

    const productIds = Array.from(new Set(logs.map((l) => l.productId).filter(Boolean)));
    const batchIds = Array.from(new Set(logs.map((l) => l.productBatchId).filter(Boolean))) as string[];

    const [products, batches] = await Promise.all([
      productIds.length
        ? this.productRepo.find({ where: { id: In(productIds) }, withDeleted: true })
        : Promise.resolve([] as Product[]),
      batchIds.length
        ? this.batchRepo.find({ where: { id: In(batchIds) }, withDeleted: true, relations: ['product'] })
        : Promise.resolve([] as ProductBatch[]),
    ]);

    const prodById = new Map(products.map((p) => [p.id, p]));
    const batchById = new Map(batches.map((b) => [b.id, b]));

    for (const l of logs) {
      if (l.productId) {
        const p = prodById.get(l.productId);
        if (p) l.product = p;
      }
      if (l.productBatchId) {
        const b = batchById.get(l.productBatchId);
        if (b) l.productBatch = b;
      }
    }
    return new Map(logs.map((l) => [l.id, l]));
  }
}
