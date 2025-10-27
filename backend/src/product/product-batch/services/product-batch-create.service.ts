// src/product/product-batch/services/product-batch-create.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductLog } from '../../product-log/entities/product-log.entity';
import { CreateProductBatchDto } from '../dto/create-product-batch.dto';
import { ProductBatch } from '../entities/product-batch.entity';
import { ProductBatchBaseService } from './product-batch-base.service';
import { ProductLogType } from 'src/common/enums/enum';

@Injectable()
export class ProductBatchCreateService extends ProductBatchBaseService {
  async create(dto: CreateProductBatchDto): Promise<ProductBatch> {
    const { productId, amount, sellPrice, cost } = dto;

    if (amount <= 0) {
      throw new BadRequestException("mikdor musbat bo'lishi kerak");
    }

    // Directly create a new product batch without recipe/assembler logic
    const savedBatch = await this.batchRepo.manager.transaction(async (em) => {
      const batchRepo = em.getRepository(ProductBatch);
      const logRepo = em.getRepository(ProductLog);

      const newBatch = await batchRepo.save(
        batchRepo.create({
          productId,
          amount,
          cost: cost ?? null,
          sellPrice: sellPrice ?? null,
        }),
      );

      await logRepo.save(
        logRepo.create({
          productId,
          productBatchId: newBatch.id,
          comment: `Mahsulot partiyasi yaratildi (miqdor=${amount}).`,
          type: ProductLogType.ADD_BATCH,
        }),
      );

      return newBatch;
    });

    return savedBatch;
  }
}
