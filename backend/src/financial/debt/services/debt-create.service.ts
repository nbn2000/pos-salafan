import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/party/client/entities/client.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { RawMaterialLog } from 'src/raw-material/raw-material-log/entities/raw-material-log.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { Debt } from '../entities/debt.entity';
import { DebtResult, toDebtResult } from '../helper';
import { DebtBaseService } from './debt-base.service';

@Injectable()
export class DebtCreateService extends DebtBaseService {
  constructor(
    @InjectRepository(Debt) private readonly repo: Repository<Debt>,
    @InjectRepository(User) userRepo: Repository<User>,
    @InjectRepository(Supplier) supplierRepo: Repository<Supplier>,
    @InjectRepository(Client) clientRepo: Repository<Client>,
    @InjectRepository(Transaction) txRepo: Repository<Transaction>,
    @InjectRepository(RawMaterialLog) rmLogRepo: Repository<RawMaterialLog>,
  ) {
    super(userRepo, supplierRepo, clientRepo, txRepo, rmLogRepo);
  }

  async create(dto: CreateDebtDto): Promise<DebtResult> {
    await this.ensurePartyExists(dto.from, 'from');
    await this.ensurePartyExists(dto.to, 'to');
    await this.ensureTransactionExists(dto.transactionId ?? null);
    await this.ensureRawMaterialLogExists(dto.rawMaterialLogId ?? null);

    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    return toDebtResult(saved);
  }
}
