import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Product } from 'src/product/product/entities/product.entity';
import { TransactionProductBatch } from 'src/transaction/entities/transaction-product-batch.entity';
import { TransactionProduct } from 'src/transaction/entities/transaction-product.entity';
import { In, Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { toNum } from '../helper';

@Injectable()
export class ClientFinanceBaseService {
  constructor(
    @InjectRepository(Client)
    protected readonly clientRepo: Repository<Client>,

    @InjectRepository(Payment)
    protected readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Debt)
    protected readonly debtRepo: Repository<Debt>,

    @InjectRepository(TransactionProduct)
    protected readonly txProdRepo: Repository<TransactionProduct>,
    @InjectRepository(TransactionProductBatch)
    protected readonly txProdBatchRepo: Repository<TransactionProductBatch>,

    @InjectRepository(Product)
    protected readonly productRepo: Repository<Product>,
  ) {}

  protected async getActiveClientOrThrow(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id, isActive: true },
    });
    if (!client) throw new NotFoundException('Mijoz topilmadi');
    return client;
  }

  // payments & debts (by tx)
  protected buildPaymentsMapByTx(
    payments: Payment[],
    perspectiveClientId?: string,
  ): Map<string, number> {
    const map = new Map<string, number>();
    for (const p of payments) {
      if (!p.isActive) continue;            // ✅ ignore inactive (reverted) rows
      if (!p.transactionId) continue;
      const amount = toNum(p.amount);
      if (!amount) continue;

      let delta = amount;
      if (perspectiveClientId) {
        if (p.from === perspectiveClientId) {
          delta = amount;
        } else if (p.to === perspectiveClientId) {
          delta = -amount;
        } else {
          continue;
        }
      }

      const prev = map.get(p.transactionId) ?? 0;
      map.set(p.transactionId, prev + delta);
    }
    return map;
  }



  protected buildDebtsMapByTx(debts: Debt[]): {
    debtMap: Map<string, number>;
    dueMap: Map<string, Date | null>;
  } {
    const debtMap = new Map<string, number>();
    const dueMap = new Map<string, Date | null>();
    for (const d of debts) {
      if (!d.isActive) continue;            // ✅ ignore inactive (reverted) rows
      if (!d.transactionId) continue;
      const prev = debtMap.get(d.transactionId) ?? 0;
      debtMap.set(d.transactionId, prev + toNum(d.amount));

      // due date removed; keep nulls
      if (!dueMap.has(d.transactionId)) dueMap.set(d.transactionId, null);
    }
    return { debtMap, dueMap };
  }


  protected collectTxIdsFromMaps(
    ...maps: Array<Map<string, number>>
  ): string[] {
    const ids: string[] = [];
    for (const m of maps) for (const k of m.keys()) ids.push(k);
    return Array.from(new Set(ids));
  }

  // load tx products & amounts
  protected async loadTxProductsAndAmounts(txIds: string[]) {
    const txProducts = await this.txProdRepo.find({
      where: { transactionId: In(txIds) },
      withDeleted: true,
      order: { createdAt: 'DESC' },
      relations: ['product'],
    });
    const tpIds = txProducts.map((tp) => tp.id);

    const tpbList = tpIds.length
      ? await this.txProdBatchRepo.find({
          where: { productId: In(tpIds), isActive: true }, // ✅ count only active batches
          withDeleted: true,
          order: { createdAt: 'ASC' },
        })
      : [];

    const amountByTp = new Map<string, number>();
    for (const b of tpbList) {
      const prev = amountByTp.get(b.productId) ?? 0;
      amountByTp.set(b.productId, prev + Number(b.amount));
    }

    return { txProducts, amountByTp };
  }


  // totals (products only)
  protected computeTotalsByTx(
    txProducts: TransactionProduct[],
    amountByTp: Map<string, number>,
  ): Map<string, number> {
    const totalsByTx = new Map<string, number>();

    for (const tp of txProducts) {
      const amt = amountByTp.get(tp.id) ?? 0;
      if (amt <= 0) continue;
      const prev = totalsByTx.get(tp.transactionId) ?? 0;
      totalsByTx.set(tp.transactionId, prev + Number(tp.soldPrice) * amt);
    }

    return totalsByTx;
  }

  protected async preloadProductsMap(
    productIds: string[],
  ): Promise<Map<string, Product>> {
    if (!productIds.length) return new Map<string, Product>();
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
      withDeleted: true,
    });
    return new Map(products.map((p) => [p.id, p]));
  }
}

