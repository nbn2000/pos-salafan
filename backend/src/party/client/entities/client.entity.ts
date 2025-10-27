import { Extender } from 'src/common/entities/common.entites';
import { Column, Entity, Index } from 'typeorm';

@Index('IDX_client_phone_active_unique', ['phone'], {
  unique: true,
  where: `"isActive" = true`,
})
@Entity({ name: 'client' })
export class Client extends Extender {
  @Column()
  name: string;

  @Column()
  phone: string;
}
