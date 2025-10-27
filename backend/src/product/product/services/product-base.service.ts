// src/product/product/services/product-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBatch } from '../../product-batch/entities/product-batch.entity';
import { ProductLog } from '../../product-log/entities/product-log.entity';
import { Product } from '../entities/product.entity';
import { ProductBatchView, ProductTotals, ProductView } from '../helper';
import { MeasurementType, Priority } from 'src/common/enums/enum';

@Injectable()
export class ProductBaseService {
  constructor(
    @InjectRepository(Product)
    protected readonly productRepo: Repository<Product>,
    @InjectRepository(ProductBatch)
    protected readonly batchRepo: Repository<ProductBatch>,
    @InjectRepository(ProductLog)
    protected readonly logRepo: Repository<ProductLog>,
  ) {}

  protected async getActiveProductOrThrow(id: string): Promise<Product> {
    const entity = await this.productRepo.findOne({
      where: { id, isActive: true },
    });
    if (!entity) throw new NotFoundException('Mahsulot topilmadi');
    return entity;
  }

  protected toProductBatchView(entity: ProductBatch): ProductBatchView {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      productId: entity.productId,
      amount: Number(entity.amount),
      cost: entity.cost == null ? null : Number(entity.cost),
      sellPrice: entity.sellPrice == null ? null : Number(entity.sellPrice),
    };
  }

  protected toProductView(
    entity: Product,
    batches: ProductBatchView[],
  ): ProductView {
    const totalBatchAmount = batches.reduce((s, b) => s + b.amount, 0);
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: entity.name,
      type: entity.type,
      priority: (entity as any).priority,
      batches,
      totalBatchAmount,
    };
  }

  // Compute store-wide totals across all active products and their batches
  protected async computeStoreTotals(): Promise<ProductTotals> {
    const batches = await this.batchRepo.find({ where: { isActive: true }, relations: ['product'] });

    let totalLowKg = 0;
    let totalHighKg = 0;
    let totalLowUnit = 0;
    let totalHighUnit = 0;

    for (const b of batches) {
      const p = b.product;
      if (!p || !p.isActive) continue;

      const amount = Number(b.amount) || 0;
      if (p.type === MeasurementType.KG) {
        if (p.priority === Priority.LOW) totalLowKg += amount;
        else if (p.priority === Priority.HIGH) totalHighKg += amount;
      } else if (p.type === MeasurementType.PIECE) {
        if (p.priority === Priority.LOW) totalLowUnit += amount;
        else if (p.priority === Priority.HIGH) totalHighUnit += amount;
      }
    }

    return { totalLowKg, totalHighKg, totalLowUnit, totalHighUnit };
  }
}
