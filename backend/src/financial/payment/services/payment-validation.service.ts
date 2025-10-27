import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/party/client/entities/client.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { RawMaterialLog } from 'src/raw-material/raw-material-log/entities/raw-material-log.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { assertUuid, assertUuidOrNull } from '../helper';

@Injectable()
export class PaymentValidationService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(RawMaterialLog)
    private readonly rmLogRepo: Repository<RawMaterialLog>,
  ) {}

  async ensurePartyExists(id: string, field: 'from' | 'to') {
    assertUuid(id, field);
    const [user, supplier, client] = await Promise.all([
      this.userRepo.findOne({ where: { id, isActive: true } }),
      this.supplierRepo.findOne({ where: { id, isActive: true } }),
      this.clientRepo.findOne({ where: { id, isActive: true } }),
    ]);
    if (!user && !supplier && !client) {
      throw new BadRequestException(
        `Noto‘g‘ri "${field}": mos keluvchi Foydalanuvchi/Yetkazib beruvchi/Mijoz topilmadi`,
      );
    }
  }

  async ensureTransactionExists(id?: string | null) {
    assertUuidOrNull(id, 'transactionId');
    if (!id) return;
    const tx = await this.txRepo.findOne({ where: { id, isActive: true } });
    if (!tx) throw new BadRequestException('Tranzaksiya topilmadi');
  }

  async ensureRawMaterialLogExists(id?: string | null) {
    assertUuidOrNull(id, 'rawMaterialLogId');
    if (!id) return;
    const log = await this.rmLogRepo.findOne({ where: { id, isActive: true } });
    if (!log) throw new BadRequestException('Xomashyo logi topilmadi');
  }
}
