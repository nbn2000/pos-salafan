import { Injectable } from '@nestjs/common';
import {
  ClientProductFinanceItem,
  ClientProductLineFinanceView,
  ClientProductsFinanceRow,
  productMini,
} from '../helper';
import { ClientFinanceBaseService } from './client-finance-base.service';

@Injectable()
export class ClientFinanceOneService extends ClientFinanceBaseService {
  async findProductsFinance(
    clientId: string,
  ): Promise<ClientProductsFinanceRow> {
    const client = await this.getActiveClientOrThrow(clientId);

    const [payments, debts] = await Promise.all([
      this.paymentRepo.find({
        where: [
          { from: clientId, isActive: true }, // ✅ only active
          { to: clientId, isActive: true },   // ✅ only active
        ],
        withDeleted: true,
      }),
      this.debtRepo.find({
        where: { from: clientId, isActive: true }, // ✅ only active
        withDeleted: true,
      }),
    ]);


    const payMap = this.buildPaymentsMapByTx(payments, clientId);
    const { debtMap } = this.buildDebtsMapByTx(debts);

    const txIds = this.collectTxIdsFromMaps(payMap, debtMap);
    if (!txIds.length) {
      return {
        client: { id: client.id, name: client.name, phone: client.phone },
        credit: 0,
        items: [],
      };
    }

    const { txProducts, amountByTp } =
      await this.loadTxProductsAndAmounts(txIds);
    const totalsByTx = this.computeTotalsByTx(txProducts, amountByTp);

    const productIdsAll = Array.from(
      new Set(txProducts.map((tp) => tp.productId)),
    );
    const productMap = await this.preloadProductsMap(productIdsAll);

    const byProduct = new Map<string, typeof txProducts>();
    for (const tp of txProducts) {
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

        const total = lineRevenue; // = txTotal * share
        const paid = payTx * share;
        const due = Math.max(total - paid, 0);
        const debtShare = debtTx * share; // reference

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

    return {
      client: { id: client.id, name: client.name, phone: client.phone },
      credit: clientCredit,
      items,
    };
  }
}
