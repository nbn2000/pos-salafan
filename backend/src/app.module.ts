import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';

import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtRoleGuard } from './auth/guards/jwt-auth.guard';
import { FinancialModule } from './financial/financial.module';
import { PartyModule } from './party/party.module';
import { ProductModule } from './product/product.module';
import { RawMaterialModule } from './raw-material/raw-material.module';
import { SaleModule } from './sale/sale.module';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';

import { ClsUserInterceptor } from './common/interceptors/cls-user.interceptor';
import { AuditSubscriber } from './common/subscribers/audit.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }, // attaches a store to each incoming request
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),
    UserModule,
    AuthModule,
    PartyModule,
    FinancialModule,
    RawMaterialModule,
    ProductModule,
    TransactionModule,
    SaleModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtRoleGuard },
    { provide: APP_INTERCEPTOR, useClass: ClsUserInterceptor },
    AuditSubscriber,
  ],
})
export class AppModule {}
