// src/client/services/client-with-debts.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { paginateAndFilter } from 'src/common/utils/pagination.util';
import { Debt } from 'src/financial/debt/entities/debt.entity';
import { In, Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { ClientsProductsFinancePaged } from '../helper';
import { ClientFinanceAllService } from './client-finance-all.service';

@Injectable()
export class ClientWithDebtsService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,
    private readonly financeAll: ClientFinanceAllService,
  ) {}

  async findAllWithDebts(
    query: PaginationQueryDto,
  ): Promise<ClientsProductsFinancePaged> {
    const page = await paginateAndFilter(this.repo, query, { isActive: true });
    const clients = page.results;
    if (!clients.length) {
      return { ...page, results: [] } as ClientsProductsFinancePaged;
    }

    const clientIds = clients.map((c) => c.id);

    // only active debts
    const debts = await this.debtRepo.find({
      where: { from: In(clientIds), isActive: true },
    });

    const debtByClient = new Map<string, number>();
    for (const d of debts) {
      const prev = debtByClient.get(d.from) ?? 0;
      debtByClient.set(d.from, prev + Number(d.amount));
    }

    const clientsWithDebt = clients.filter(
      (c) => (debtByClient.get(c.id) ?? 0) > 1e-9,
    );
    if (!clientsWithDebt.length) {
      return { ...page, results: [] } as ClientsProductsFinancePaged;
    }

    const full = await this.financeAll.findAllProductsFinance(query);
    const onlyWithDebt = full.results.filter((row) => row.credit > 0);

    return { ...full, results: onlyWithDebt, count: onlyWithDebt.length };
  }
}
