import { Extender } from 'src/common/entities/common.entites';
import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TransactionProduct } from './transaction-product.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'transaction_product_batch' })
export class TransactionProductBatch extends Extender {
  @Column('numeric')
  amount: number;

  @ManyToOne(() => Transaction, { eager: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  transactionId: string;

  // NOTE: This is the id of TransactionProduct, not Product
  @ManyToOne(() => TransactionProduct, { eager: true })
  @JoinColumn({ name: 'productId' })
  transactionProduct: TransactionProduct;

  @Column()
  productId: string;

  @ManyToOne(() => ProductBatch, { eager: true })
  @JoinColumn({ name: 'productBatchId' })
  productBatch: ProductBatch;

  @Column()
  productBatchId: string;
}
