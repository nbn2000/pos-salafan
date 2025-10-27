import { Extender } from 'src/common/entities/common.entites';
import { numericTransformer } from 'src/product/product-log/helper';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity({ name: 'product_batch' })
export class ProductBatch extends Extender {
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'numeric', transformer: numericTransformer })
  amount: number;

  // Optional per-unit cost for profit analytics
  @Column({ type: 'numeric', transformer: numericTransformer, nullable: true })
  cost?: number | null;

  @Column({ type: 'numeric', transformer: numericTransformer, nullable: true })
  sellPrice?: number | null;
}
