// src/financial/financial.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Debt
import { DebtController } from './debt/debt.controller';
import { Debt } from './debt/entities/debt.entity';
import { DebtCreateService } from './debt/services/debt-create.service';
import { DebtFindAllService } from './debt/services/debt-find-all.service';
import { DebtFindOneService } from './debt/services/debt-find-one.service';
import { DebtUpdateService } from './debt/services/debt-update.service';
import { DebtService } from './debt/services/debt.service';

// Payment
import { Payment } from './payment/entities/payment.entity';
import { PaymentController } from './payment/payment.controller';
import { PaymentCreateService } from './payment/services/payment-create.service';
import { PaymentFindAllService } from './payment/services/payment-find-all.service';
import { PaymentFindOneService } from './payment/services/payment-find-one.service';
import { PaymentUpdateService } from './payment/services/payment-update.service';
import { PaymentValidationService } from './payment/services/payment-validation.service';
import { PaymentService } from './payment/services/payment.service';

// extra entities for validation
import { Client } from 'src/party/client/entities/client.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { RawMaterialLog } from 'src/raw-material/raw-material-log/entities/raw-material-log.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Debt,
      Payment,
      User,
      Supplier,
      Client,
      Transaction,
      RawMaterialLog,
    ]),
  ],
  controllers: [DebtController, PaymentController],
  providers: [
    // Debt
    DebtService,
    DebtCreateService,
    DebtFindAllService,
    DebtFindOneService,
    DebtUpdateService,

    // Payment
    PaymentService,
    PaymentCreateService,
    PaymentFindAllService,
    PaymentFindOneService,
    PaymentUpdateService,
    PaymentValidationService, // 👈 Added here
  ],
  exports: [DebtService, PaymentService],
})
export class FinancialModule {}
