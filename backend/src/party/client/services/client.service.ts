// src/client/services/client.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/common/utils/pagination.util';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import {
  ClientDeletedResult,
  ClientProductsFinanceRow,
  ClientResult,
  ClientsProductsFinancePaged,
} from '../helper';
import { ClientCreateService } from './client-create.service';
import { ClientFinanceAllService } from './client-finance-all.service';
import { ClientFinanceOneService } from './client-finance-one.service';
import { ClientFindAllService } from './client-find-all.service';
import { ClientFindOneService } from './client-find-one.service';
import { ClientRemoveService } from './client-remove.service';
import { ClientUpdateService } from './client-update.service';
import { ClientWithDebtsService } from './client-with-debts.service';

@Injectable()
export class ClientService {
  constructor(
    private readonly creator: ClientCreateService,
    private readonly finderAll: ClientFindAllService,
    private readonly finderOne: ClientFindOneService,
    private readonly updater: ClientUpdateService,
    private readonly remover: ClientRemoveService,
    private readonly financeOne: ClientFinanceOneService,
    private readonly financeAll: ClientFinanceAllService,
    private readonly withDebts: ClientWithDebtsService,
  ) {}

  // CRUD
  create(dto: CreateClientDto): Promise<ClientResult> {
    return this.creator.create(dto);
  }

  findAll(query: PaginationQueryDto): Promise<PaginationResult<ClientResult>> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<ClientResult> {
    return this.finderOne.findOne(id);
  }

  update(id: string, dto: UpdateClientDto): Promise<ClientResult> {
    return this.updater.update(id, dto);
  }

  remove(id: string): Promise<ClientDeletedResult> {
    return this.remover.remove(id);
  }

  // Finance
  findProductsFinance(clientId: string): Promise<ClientProductsFinanceRow> {
    return this.financeOne.findProductsFinance(clientId);
  }

  findAllProductsFinance(
    query: PaginationQueryDto,
  ): Promise<ClientsProductsFinancePaged> {
    return this.financeAll.findAllProductsFinance(query);
  }

  findAllWithDebts(
    query: PaginationQueryDto,
  ): Promise<ClientsProductsFinancePaged> {
    return this.withDebts.findAllWithDebts(query);
  }
}
