// src/product/product-batch/services/product-batch-remove.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductBatch } from '../entities/product-batch.entity';
import { ProductBatchBaseService } from './product-batch-base.service';
import { ProductLogType } from 'src/common/enums/enum';

@Injectable()
export class ProductBatchRemoveService extends ProductBatchBaseService {
  async remove(id: string): Promise<ProductBatch> {
    const batch = await this.getActiveBatchOrThrow(id);

    // ⛔ Guard: cannot delete batch that still has stock
    if (Number(batch.amount) > 0) {
      throw new BadRequestException(
        `Mahsulot partiyasini o‘chirish mumkin emas: qolgan zaxira ${Number(
          batch.amount,
        )}. Avval nolga tushiring yoki sozlang.`,
      );
    }

    batch.isActive = false;
    batch.deletedAt = new Date();
    const saved = await this.batchRepo.save(batch);

    // Log deletion
    await this.productLogRepo.save(
      this.productLogRepo.create({
        productId: saved.productId,
        productBatchId: saved.id,
        comment: `Mahsulot partiyasi o'chirildi (id=${saved.id}).`,
        type: ProductLogType.DELETE_BATCH,
      }),
    );

    return saved;
  }
}
