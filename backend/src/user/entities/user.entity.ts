// entities/user.entity.ts
import { Extender } from 'src/common/entities/common.entites';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'user' })
export class User extends Extender {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}
