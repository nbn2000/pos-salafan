import { Extender } from 'src/common/entities/common.entites';
import { PaymentType } from 'src/common/enums/enum';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'payment' })
export class Payment extends Extender {
  @Column('numeric', { default: 0 })
  amount: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.CASH })
  paymentType: PaymentType;

  @Column({ default: '' })
  comment: string;

  @Column({ type: 'uuid', nullable: true })
  transactionId: string | null;

  @Column({ type: 'uuid', nullable: true })
  rawMaterialLogId: string | null;
}
