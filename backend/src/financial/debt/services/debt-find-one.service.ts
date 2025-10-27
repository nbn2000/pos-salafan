import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from '../entities/debt.entity';
import { assertUuid, DebtResult, toDebtResult } from '../helper';

@Injectable()
export class DebtFindOneService {
  constructor(
    @InjectRepository(Debt) private readonly repo: Repository<Debt>,
  ) {}

  async findOne(id: string): Promise<DebtResult> {
    assertUuid(id, 'id');
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Qarz topilmadi');
    return toDebtResult(entity);
  }
}
