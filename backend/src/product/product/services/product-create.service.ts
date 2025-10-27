import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductBatch } from '../../product-batch/entities/product-batch.entity';
import { ProductLog } from '../../product-log/entities/product-log.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { ProductView } from '../helper';
import { Priority } from 'src/common/enums/enum';
import { ProductBaseService } from './product-base.service';
import { ProductLogType } from 'src/common/enums/enum';

@Injectable()
export class ProductCreateService extends ProductBaseService {
  // Facade wires this at runtime: (id: string) => Promise<ProductView>
  public findOne!: (id: string) => Promise<ProductView>;

  async create(dto: CreateProductDto): Promise<ProductView> {
    const { name, amount, sellPrice, type, cost } = dto;

    if (amount <= 0) {
      throw new BadRequestException("mikdor musbat bo'lishi kerak");
    }
    // minAmount removed from business logic

    const createdBatch = await this.productRepo.manager.transaction(async (em) => {
      const productRepo = em.getRepository(Product);
      const batchRepo = em.getRepository(ProductBatch);
      const logRepo = em.getRepository(ProductLog);

      const product = await productRepo.save(
        productRepo.create({ name, type, priority: dto.priority ?? Priority.LOW }),
      );

      const batch = await batchRepo.save(
        batchRepo.create({
          productId: product.id,
          amount,
          cost: cost ?? null,
          sellPrice: sellPrice ?? null,
        }),
      );

      await logRepo.save(
        logRepo.create({
          productId: product.id,
          productBatchId: batch.id,
          comment: `Mahsulot yaratildi va partiya qo'shildi (miqdor=${amount}).`,
          type: ProductLogType.ADD,
        }),
      );

      return { productId: product.id };
    });

    return this.findOne(createdBatch.productId);
  }
}
