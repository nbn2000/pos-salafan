import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SaleBaseService } from './sale-base.service';

@Injectable()
export class SaleFindOneService extends SaleBaseService {
  async findOne(params: {
    productId: string;
    includeBatches?: boolean | string;
  }) {
    const includeBatches =
      String(params.includeBatches ?? 'true').toLowerCase() === 'true';

    if (!params.productId) {
      throw new BadRequestException('productId is required.');
    }

    const product = await this.productRepo.findOne({
      where: { id: params.productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const batches = includeBatches
      ? await this.productBatchRepo.find({
          where: { productId: product.id, isActive: true },
          order: { createdAt: 'DESC' },
        })
      : [];

    return {
      kind: 'product',
      product,
      ...(includeBatches ? { batches } : {}),
    };
  }
}
