import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/common/utils/pagination.util';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { UpdateDebtDto } from '../dto/update-debt.dto';
import { DebtResult } from '../helper';
import { DebtCreateService } from './debt-create.service';
import { DebtFindAllService } from './debt-find-all.service';
import { DebtFindOneService } from './debt-find-one.service';
import { DebtUpdateService } from './debt-update.service';

@Injectable()
export class DebtService {
  constructor(
    private readonly creator: DebtCreateService,
    private readonly finderAll: DebtFindAllService,
    private readonly finderOne: DebtFindOneService,
    private readonly updater: DebtUpdateService,
  ) {}

  create(dto: CreateDebtDto): Promise<DebtResult> {
    return this.creator.create(dto);
  }

  findAll(query: PaginationQueryDto): Promise<PaginationResult<DebtResult>> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<DebtResult> {
    return this.finderOne.findOne(id);
  }

  update(id: string, dto: UpdateDebtDto): Promise<DebtResult> {
    return this.updater.update(id, dto);
  }
}
