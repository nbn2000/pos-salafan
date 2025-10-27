import { Extender } from 'src/common/entities/common.entites';
import { Column, Entity, OneToMany } from 'typeorm';
import { TransactionProduct } from './transaction-product.entity';

@Entity({ name: 'transaction' })
export class Transaction extends Extender {
  @Column('numeric', { default: 0 })
  totalSoldPrice: number;

  @OneToMany(() => TransactionProduct, (p) => p.transaction)
  products: TransactionProduct[];

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'boolean', default: false })
  isReversed: boolean;

  @Column({ type: 'timestamp', nullable: true,  })
  reversedAt: Date | null;
}
