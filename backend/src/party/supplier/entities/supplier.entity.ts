import { Extender } from 'src/common/entities/common.entites';
import { Column, Entity, Index } from 'typeorm';

@Index('IDX_supplier_phone_active_unique', ['phone'], {
  unique: true,
  where: `"isActive" = true`,
})
@Entity({ name: 'supplier' })
export class Supplier extends Extender {
  @Column()
  name: string;

  @Column()
  phone: string;
}
