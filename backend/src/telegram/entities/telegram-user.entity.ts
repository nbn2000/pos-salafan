import { Column, Entity } from 'typeorm';
import { Extender } from 'src/common/entities/common.entites';

@Entity({ name: 'telegram_user' })
export class TelegramUser extends Extender {
  @Column({ type: 'varchar', length: 64 })
  telegramId: string; // ctx.from.id

  @Column({ type: 'varchar', length: 64 })
  chatId: string; // ctx.chat.id

  @Column({ type: 'uuid' })
  userId: string; // mapped backend user id

  @Column({ type: 'varchar', length: 128 })
  username: string; // backend username snapshot

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text' })
  refreshToken: string;
}

