// src/product/product/services/product-update.service.ts
import { Injectable } from '@nestjs/common';
import { MeasurementType, ProductLogType } from 'src/common/enums/enum';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductView } from '../helper';
import { ProductBaseService } from './product-base.service';

function mtLabel(t: MeasurementType | undefined) {
  return t === undefined ? '' : String(t);
}

@Injectable()
export class ProductUpdateService extends ProductBaseService {
  // Facade wires this at runtime: (id: string) => Promise<ProductView>
  public findOne!: (id: string) => Promise<ProductView>;

  async update(id: string, dto: UpdateProductDto): Promise<ProductView> {
    const entity = await this.getActiveProductOrThrow(id);

    const logs: string[] = [];

    // Mutate + collect change logs (human-friendly, no IDs)
    if (dto.name !== undefined && dto.name !== entity.name) {
      logs.push(`Mahsulot nomi ${entity.name} -> ${dto.name}.`);
      entity.name = dto.name;
    }
    if (dto.type !== undefined && dto.type !== entity.type) {
      logs.push(`Mahsulot turi ${mtLabel(entity.type)} -> ${mtLabel(dto.type)}.`);
      entity.type = dto.type;
    }
    if (dto.priority !== undefined && dto.priority !== (entity as any).priority) {
      logs.push(`Mahsulot prioriteti ${String((entity as any).priority)} -> ${String(dto.priority)}.`);
      (entity as any).priority = dto.priority as any;
    }

    await this.productRepo.save(entity);

    // Write one log entry per change (if any)
    if (logs.length) {
      await this.logRepo.save(
        logs.map((comment) =>
          this.logRepo.create({
            productId: entity.id,
            productBatchId: null,
            comment,
            type: ProductLogType.CHANGE,
          }),
        ),
      );
    }

    return this.findOne(entity.id);
  }
}
