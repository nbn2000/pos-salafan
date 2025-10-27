// src/product/product/services/product-find-one.service.ts
import { Injectable } from '@nestjs/common';
import { ProductBatchView, ProductView } from '../helper';
import { ProductBaseService } from './product-base.service';

@Injectable()
export class ProductFindOneService extends ProductBaseService {
  async findOne(id: string): Promise<ProductView> {
    const entity = await this.getActiveProductOrThrow(id);

    const batches = await this.batchRepo.find({
      where: { productId: id, isActive: true },
      order: { createdAt: 'DESC' },
    });

    const batchViews: ProductBatchView[] = batches.map((b) =>
      this.toProductBatchView(b),
    );

    return this.toProductView(entity, batchViews);
  }
}
