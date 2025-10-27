// src/product/product-log/services/product-log-find-one.service.ts
import { Injectable } from '@nestjs/common';
import { ProductLogResult, toLogResult } from '../helper';
import { ProductLogBaseService } from './product-log-base.service';

@Injectable()
export class ProductLogFindOneService extends ProductLogBaseService {
  // FIND ONE – includes product + batch (logic unchanged)
  async findOne(id: string): Promise<ProductLogResult> {
    const log = await this.getActiveLogOrThrow(id);
    return toLogResult(log);
  }
}
