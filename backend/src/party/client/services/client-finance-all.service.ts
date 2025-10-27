import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { paginateAndFilter } from 'src/common/utils/pagination.util';
import { In } from 'typeorm';
import {
  ClientProductFinanceItem,
  ClientProductLineFinanceView,
  ClientProductsFinanceRow,
  ClientsProductsFinancePaged,
  productMini,
} from '../helper';
import { ClientFinanceBaseService } from './client-finance-base.service';

@Injectable()
export class ClientFinanceAllService extends ClientFinanceBaseService {
  async findAllProductsFinance(
    query: PaginationQueryDto,
  ): Promise<ClientsProductsFinancePaged> {
    const page = await paginateAndFilter(this.clientRepo, query, {
      isActive: true,
    });
    const clients = page.results;
    if (!clients.length) {
      return { ...page, results: [] } as ClientsProductsFinancePaged;
    }

    const clientIds = clients.map((c) => c.id);

    const [payments, debts] = await Promise.all([
      this.paymentRepo.find({
        where: [
          { from: In(clientIds), isActive: true }, // ✅ only active
          { to: In(clientIds), isActive: true },   // ✅ only active
        ],
        withDeleted: true,
      }),
      this.debtRepo.find({
        where: { from: In(clientIds), isActive: true }, // ✅ only active
        withDeleted: true,
      }),
    ]);


    const dueByClientTx = new Map<string, Map<string, Date | null>>();
    for (const d of debts) {
      if (!d.transactionId || !d.from) continue;
      const dueMap = dueByClientTx.get(d.from) ?? new Map<string, Date | null>();
      if (!dueMap.has(d.transactionId)) dueMap.set(d.transactionId, null);
      dueByClientTx.set(d.from, dueMap);
    }

    const txIds = Array.from(
      new Set([
        ...payments.map((p) => p.transactionId).filter(Boolean),
        ...debts.map((d) => d.transactionId).filter(Boolean),
      ]),
    ) as string[];

    if (!txIds.length) {
      return { ...page, results: [] } as ClientsProductsFinancePaged;
    }

    const { txProducts, amountByTp } =
      await this.loadTxProductsAndAmounts(txIds);
    const totalsByTx = this.computeTotalsByTx(txProducts, amountByTp);

    const productIdsAll = Array.from(
      new Set(txProducts.map((tp) => tp.productId)),
    );
    const productMap = await this.preloadProductsMap(productIdsAll);

    const rows: ClientProductsFinanceRow[] = [];

    for (const c of clients) {
      const payMap = this.buildPaymentsMapByTx(
        payments.filter((p) => p.from === c.id || p.to === c.id),
        c.id,
      );
      const { debtMap } = this.buildDebtsMapByTx(
        debts.filter((d) => d.from === c.id),
      );
      // const debtDueMap = dueByClientTx.get(c.id) ?? new Map<string, Date | null>();

      const clientTxIds = new Set<string>([
        ...Array.from(payMap.keys()),
        ...Array.from(debtMap.keys()),
      ]);

      if (!clientTxIds.size) {
        rows.push({
          client: { id: c.id, name: c.name, phone: c.phone },
          credit: 0,
          items: [],
        });
        continue;
      }

      const tpsForClient = txProducts.filter((tp) =>
        clientTxIds.has(tp.transactionId),
      );

      const byProduct = new Map<string, typeof tpsForClient>();
      for (const tp of tpsForClient) {
        const list = byProduct.get(tp.productId) ?? [];
        list.push(tp);
        byProduct.set(tp.productId, list);
      }

      const items: ClientProductFinanceItem[] = [];
      let clientCredit = 0;

      for (const [productId, lines] of byProduct.entries()) {
        const product = productMap.get(productId) ?? lines[0].product;
        const lineViews: ClientProductLineFinanceView[] = [];

        let prodCredit = 0;

        for (const tp of lines) {
          const amt = amountByTp.get(tp.id) ?? 0;
          if (amt <= 0) continue;

          const lineRevenue = Number(tp.soldPrice) * amt;
          const txTotal = totalsByTx.get(tp.transactionId) ?? 0;
          const payTx = payMap.get(tp.transactionId) ?? 0;
          const debtTx = debtMap.get(tp.transactionId) ?? 0;

          const share = txTotal > 0 ? lineRevenue / txTotal : 0;

          const total = lineRevenue;
          const paid = payTx * share;
          const due = Math.max(total - paid, 0);
          const debtShare = debtTx * share;

          prodCredit += due;

          lineViews.push({
            transactionId: tp.transactionId,
            amount: amt,
            soldPrice: Number(tp.soldPrice),
            total,
            paid,
            due,
            debt: debtShare,
          });
        }

        clientCredit += prodCredit;

        items.push({
          product: productMini(product),
          credit: prodCredit,
          lines: lineViews,
        });
      }

      rows.push({
        client: { id: c.id, name: c.name, phone: c.phone },
        credit: clientCredit,
        items,
      });
    }

    return { ...page, results: rows };
  }
}
