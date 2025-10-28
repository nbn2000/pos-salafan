import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TelegramUser } from './entities/telegram-user.entity';
import { TelegramBotService } from './telegram.update';
import { TelegramStateService } from './telegram.state';
import { AuthModule } from 'src/auth/auth.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([TelegramUser]),
    AuthModule,
    AnalyticsModule,
  ],
  providers: [TelegramBotService, TelegramStateService],
})
export class TelegramModule {}
