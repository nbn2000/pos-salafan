import { Extender } from 'src/common/entities/common.entites';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductBatch } from '../../product-batch/entities/product-batch.entity';
import { MeasurementType, Priority } from 'src/common/enums/enum';

@Entity({ name: 'product' })
export class Product extends Extender {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => ProductBatch, (b) => b.product)
  batches: ProductBatch[];

  @Column({ type: 'enum', enum: MeasurementType, default: MeasurementType.KG })
  type: MeasurementType;

  @Column({ type: 'enum', enum: Priority, default: Priority.LOW })
  priority: Priority;
}
