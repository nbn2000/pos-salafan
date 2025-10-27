// src/product/product-batch/services/product-batch-update.service.ts
import { Injectable } from '@nestjs/common';
import { UpdateProductBatchDto } from '../dto/update-product-batch.dto';
import { ProductBatch } from '../entities/product-batch.entity';
import { ProductBatchBaseService } from './product-batch-base.service';
import { ProductLogType } from 'src/common/enums/enum';

@Injectable()
export class ProductBatchUpdateService extends ProductBatchBaseService {
  async update(id: string, dto: UpdateProductBatchDto): Promise<ProductBatch> {
    const batch = await this.getActiveBatchOrThrow(id);

    const prev = {
      amount: Number(batch.amount),
      sellPrice: batch.sellPrice == null ? null : Number(batch.sellPrice),
      cost: batch.cost == null ? null : Number(batch.cost),
    };

    if (dto.amount !== undefined) batch.amount = dto.amount;
    if (dto.sellPrice !== undefined) batch.sellPrice = dto.sellPrice;
    if (dto.cost !== undefined) batch.cost = dto.cost;

    const saved = await this.batchRepo.save(batch);

    const changes: string[] = [];
    if (dto.amount !== undefined && Number(dto.amount) !== prev.amount) {
      changes.push(`miqdor: ${prev.amount} -> ${dto.amount}`);
    }
    if (dto.sellPrice !== undefined && (prev.sellPrice ?? null) !== (dto.sellPrice ?? null)) {
      changes.push(`sotish narxi: ${prev.sellPrice ?? 'null'} -> ${dto.sellPrice ?? 'null'}`);
    }
    if (dto.cost !== undefined && (prev.cost ?? null) !== (dto.cost ?? null)) {
      changes.push(`tannarx: ${prev.cost ?? 'null'} -> ${dto.cost ?? 'null'}`);
    }

    if (changes.length) {
      await this.productLogRepo.save(
        this.productLogRepo.create({
          productId: saved.productId,
          productBatchId: saved.id,
          comment: `Partiya tahrirlandi (id=${saved.id}): ${changes.join(', ')}`,
          type: ProductLogType.CHANGE_BATCH,
        }),
      );
    }

    return saved;
  }
}
