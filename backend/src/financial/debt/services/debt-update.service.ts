import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/party/client/entities/client.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { RawMaterialLog } from 'src/raw-material/raw-material-log/entities/raw-material-log.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateDebtDto } from '../dto/update-debt.dto';
import { Debt } from '../entities/debt.entity';
import { assertUuid, DebtResult, toDebtResult } from '../helper';
import { DebtBaseService } from './debt-base.service';

@Injectable()
export class DebtUpdateService extends DebtBaseService {
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

  async update(id: string, dto: UpdateDebtDto): Promise<DebtResult> {
    assertUuid(id, 'id');
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Qarz topilmadi');

    if (dto.from !== undefined) await this.ensurePartyExists(dto.from, 'from');
    if (dto.to !== undefined) await this.ensurePartyExists(dto.to, 'to');
    if (dto.transactionId !== undefined)
      await this.ensureTransactionExists(dto.transactionId ?? null);
    if (dto.rawMaterialLogId !== undefined)
      await this.ensureRawMaterialLogExists(dto.rawMaterialLogId ?? null);

    Object.assign(entity, dto);
    const saved = await this.repo.save(entity);
    return toDebtResult(saved);
  }
}
