import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBatch } from '../../product-batch/entities/product-batch.entity';
import { ProductLog } from '../../product-log/entities/product-log.entity';
import { Product } from '../entities/product.entity';
import { ProductLogType } from 'src/common/enums/enum';

@Injectable()
export class ProductRemoveService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductLog)
    private readonly logRepo: Repository<ProductLog>,
  ) {}

  async remove(id: string): Promise<{ success: true }> {
    const exists = await this.productRepo.exist({ where: { id, isActive: true } });
    if (!exists) throw new NotFoundException('Mahsulot topilmadi');

    // Prevent delete if there is stock left in any active batch
    const batchRepo = this.productRepo.manager.getRepository(ProductBatch);
    const activeBatches = await batchRepo.find({
      where: { productId: id, isActive: true },
      order: { createdAt: 'ASC' },
    });
    const withStock = activeBatches.filter((b) => Number(b.amount) > 0);
    if (withStock.length) {
      const details = withStock
        .map((b, i) => `${i + 1}) partiyada ${Number(b.amount)}`)
        .join('; ');
      const totalLeft = withStock.reduce((s, b) => s + Number(b.amount), 0);

      throw new BadRequestException(
        `Mahsulotni o'chirishning iloji yo'q: zaxira qolgan — jami ${totalLeft}. Qolgan partiyalar: ${details}. Avval partiya(lar)ni tugating yoki 0 ga tushiring.`,
      );
    }

    await this.productRepo.update(id, { isActive: false, deletedAt: new Date() });

    await this.logRepo.save(
      this.logRepo.create({
        productId: id,
        productBatchId: null,
        comment: "Mahsulot o'chirildi (soft)",
        type: ProductLogType.DELETE,
      }),
    );

    return { success: true };
  }
}
