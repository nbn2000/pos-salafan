import { Extender } from 'src/common/entities/common.entites';
import { Product } from 'src/product/product/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TransactionProductBatch } from './transaction-product-batch.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'transaction_product' })
export class TransactionProduct extends Extender {
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Transaction, { eager: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  transactionId: string;

  @Column('numeric', { default: 0 })
  soldPrice: number;

  @OneToMany(() => TransactionProductBatch, (b) => b.transactionProduct)
  batches: TransactionProductBatch[];
}
