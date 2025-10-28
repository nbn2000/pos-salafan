// src/product/product-log/services/product-log-find-one.service.ts
import { Injectable } from '@nestjs/common';
import { ProductLogResult, toLogResult } from '../helper';
import { ProductLogBaseService } from './product-log-base.service';

@Injectable()
export class ProductLogFindOneService extends ProductLogBaseService {
  // FIND ONE – includes product + batch (logic unchanged)
  async findOne(id: string): Promise<ProductLogResult> {
    const base = await this.logRepo.findOne({ where: { id, isActive: true }, withDeleted: true });
    if (!base)
      throw new (await import('@nestjs/common')).NotFoundException(
        'Mahsulot logi topilmadi',
      );
    const map = await this.hydrateWithRelations([base.id]);
    return toLogResult(map.get(base.id) ?? base);
  }
}
