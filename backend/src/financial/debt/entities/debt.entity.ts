import { Extender } from 'src/common/entities/common.entites';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'debt' })
export class Debt extends Extender {
  @Column('numeric', { default: 0 })
  amount: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ default: '' })
  comment: string;

  @Column({ type: 'uuid', nullable: true })
  transactionId: string | null;

  @Column({ type: 'uuid', nullable: true })
  rawMaterialLogId: string | null;
}
