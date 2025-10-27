import { Extender } from 'src/common/entities/common.entites';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductBatch } from '../../product-batch/entities/product-batch.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductLogType } from 'src/common/enums/enum';

@Entity({ name: 'product_log' })
export class ProductLog extends Extender {
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => ProductBatch, { eager: true, nullable: true })
  @JoinColumn({ name: 'productBatchId' })
  productBatch?: ProductBatch | null;

  @Column({ nullable: true })
  productBatchId?: string | null;

  @Column({ type: 'enum', enum: ProductLogType, default: ProductLogType.CHANGE })
  type: ProductLogType;

  @Column()
  comment: string;
}
