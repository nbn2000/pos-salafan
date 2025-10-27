// src/product/product-batch/services/product-batch-find-one.service.ts
import { Injectable } from '@nestjs/common';
import { ProductBatchResult, toBatchResult } from '../helper';
import { ProductBatchBaseService } from './product-batch-base.service';

@Injectable()
export class ProductBatchFindOneService extends ProductBatchBaseService {
  async findOne(id: string): Promise<ProductBatchResult> {
    const batch = await this.getActiveBatchOrThrow(id);
    return toBatchResult(batch);
  }
}
