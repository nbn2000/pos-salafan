// src/product/product-log/services/product-log-remove.service.ts
import { Injectable } from '@nestjs/common';
import { ProductLog } from '../entities/product-log.entity';
import { ProductLogBaseService } from './product-log-base.service';

@Injectable()
export class ProductLogRemoveService extends ProductLogBaseService {
  // REMOVE – soft delete (logic unchanged)
  async remove(id: string): Promise<ProductLog> {
    const log = await this.getActiveLogOrThrow(id);
    log.isActive = false;
    log.deletedAt = new Date();
    return this.logRepo.save(log);
  }
}
