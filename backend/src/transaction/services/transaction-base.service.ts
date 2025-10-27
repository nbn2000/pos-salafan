import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Client } from 'src/party/client/entities/client.entity';

import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { ProductLog } from 'src/product/product-log/entities/product-log.entity';
import { Product } from 'src/product/product/entities/product.entity';
import { ProductLogType } from 'src/common/enums/enum';

import { TransactionProductBatch } from '../entities/transaction-product-batch.entity';
import { TransactionProduct } from '../entities/transaction-product.entity';
import { Transaction } from '../entities/transaction.entity';

import {
  assertUuid,
  toTPBResult,
  toTPResult,
  toTResult,
  TransactionProductResult,
  TransactionResult,
  TxFinanceSummary,
} from '../helper';

// ---------- File-scope type aliases ----------
type ResolvedProdLine = {
  productId: string;
  amount: number;
  per: number; // <-- resolved SOLD PRICE PER UNIT (from request or fallback)
  
};
type DebtAgg = { uzs: number; clientId?: string; dueAt: Date | null };
type PayAgg = { uzs: number; clientIdHint?: string };

@Injectable()
export class TransactionBaseService {
  constructor(
    @InjectRepository(Transaction)
    protected readonly txRepo: Repository<Transaction>,
    @InjectRepository(TransactionProduct)
    protected readonly txProdRepo: Repository<TransactionProduct>,
    @InjectRepository(TransactionProductBatch)
    protected readonly txProdBatchRepo: Repository<TransactionProductBatch>,

    @InjectRepository(Product)
    protected readonly productRepo: Repository<Product>,
    @InjectRepository(ProductBatch)
    protected readonly productBatchRepo: Repository<ProductBatch>,
    @InjectRepository(ProductLog)
    protected readonly productLogRepo: Repository<ProductLog>,

    @InjectRepository(Payment)
    protected readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Debt)
    protected readonly debtRepo: Repository<Debt>,
    @InjectRepository(Client)
    protected readonly clientRepo: Repository<Client>,
  ) {}

  protected async getActiveClientOrThrow(id: string): Promise<Client> {
    assertUuid(id, 'clientId');
    const entity = await this.clientRepo.findOne({
      where: { id, isActive: true },
    });
    if (!entity) throw new BadRequestException('Mijoz topilmadi');
    return entity;
  }

  protected getActiveUserOrThrow(id: string): void {
    // Kept as assert-only; caller verifies user upstream or via guard.
    assertUuid(id, 'userId');
  }

  // -------- Price/stock helpers --------

  protected async totalProductStock(productId: string) {
    const batches = await this.productBatchRepo.find({
      where: { productId, isActive: true },
      order: { createdAt: 'ASC' },
    });
    return {
      batches,
      total: batches.reduce((s, b) => s + Number(b.amount), 0),
    };
  }

  protected async latestProductSellPrice(
    productId: string,
  ): Promise<number | null> {
    const latest = await this.productBatchRepo.findOne({
      where: { productId, isActive: true },
      order: { createdAt: 'DESC' },
    });
    return latest?.sellPrice != null ? Number(latest.sellPrice) : null;
  }

  // -------- Resolve lines (validations + default per-unit price) --------

  protected async resolveProducts(
    items: Array<{
      productId: string;
      amount: number;
      soldPrice?: number | null; // <-- from request
      
    }>,
  ): Promise<ResolvedProdLine[]> {
    if (!items?.length) return [];

    const productIds = items.map((x) => x.productId);
    productIds.forEach((id, i) => assertUuid(id, `products[${i}].productId`));

    const products = await this.productRepo.find({
      where: { id: In(productIds), isActive: true },
    });
    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !found.has(id));
      throw new BadRequestException(
        `Mahsulot(lar) topilmadi: ${missing.join(', ')}`,
      );
    }
    const productMap = new Map(products.map((p) => [p.id, p]));

    const resolved: ResolvedProdLine[] = [];
    for (const line of items) {
      const { total } = await this.totalProductStock(line.productId);
      if (total + 1e-12 < Number(line.amount)) {
        const name = productMap.get(line.productId)?.name ?? line.productId;
        throw new BadRequestException(
          `"${name}" mahsuloti uchun zaxira yetarli emas: kerak ${line.amount}, mavjud ${total}`,
        );
      }
      const has = line.soldPrice !== undefined && line.soldPrice !== null;
      let per = has ? Number(line.soldPrice) : 0;
      if (!has) {
        const latest = await this.latestProductSellPrice(line.productId);
        if (latest == null) {
          throw new BadRequestException(
            `Mahsulot uchun sotish narxini aniqlash uchun faol partiya topilmadi ${
              productMap.get(line.productId)?.name ?? line.productId
            }`,
          );
        }
        per = latest;
      }
      resolved.push({
        productId: line.productId,
        amount: Number(line.amount),
        per, // <-- carry the chosen per-unit SOLD price forward
      });
    }
    return resolved;
  }

  // -------- FIFO consumption (inside a transaction manager) --------
  // IMPORTANT CHANGE:
  // We now compute the line's payable amount from the RESOLVED per-unit sold price (request's soldPrice),
  // not from each batch's sellPrice. Batches still control stock depletion (FIFO), but do not affect price.
  protected async consumeProductsFIFO(
    em: EntityManager,
    txSaved: Transaction,
    lines: ResolvedProdLine[],
  ): Promise<number> {
    if (!lines.length) return 0;

    const txProdRepo = em.getRepository(TransactionProduct);
    const txProdBatchRepo = em.getRepository(TransactionProductBatch);
    const pBatchRepo = em.getRepository(ProductBatch);
    const pLogRepo = em.getRepository(ProductLog);

    let totalShouldPay = 0;

    for (const line of lines) {
      // Persist the per-unit SOLD price we are charging for this product line
      const tp = await txProdRepo.save(
        txProdRepo.create({
          transactionId: txSaved.id,
          productId: line.productId,
          soldPrice: line.per, // <--- per-unit from request/default
          
        }),
      );

      let remaining = line.amount;
      let lineShouldPay = 0;

      const fifoBatches = await pBatchRepo.find({
        where: { productId: line.productId, isActive: true },
        order: { createdAt: 'ASC' },
      });

      for (const b of fifoBatches) {
        if (remaining <= 0) break;
        const available = Number(b.amount);
        if (available <= 0) continue;

        const take = Math.min(available, remaining);

        // 🔧 CHANGED: price contribution uses the resolved SOLD price (line.per),
        // not the batch's sellPrice.
        lineShouldPay += take * line.per;

        await txProdBatchRepo.save(
          txProdBatchRepo.create({
            transactionId: txSaved.id,
            productId: tp.id, // link to TransactionProduct
            productBatchId: b.id,
            amount: take,
          }),
        );

        const newAmt = available - take;
        b.amount = newAmt;
        if (newAmt <= 0) {
          b.isActive = false;
          b.deletedAt = new Date();
        }
        await pBatchRepo.save(b);

        await pLogRepo.save(
          pLogRepo.create({
            productId: line.productId,
            productBatchId: b.id,
            comment: `${txSaved.id} tranzaksiyasida ${take} dona sotildi`,
            type: ProductLogType.CHANGE_BATCH,
          }),
        );

        remaining -= take;
      }

      // Include any flat service charge per product line
      totalShouldPay += lineShouldPay ;
    }

    return totalShouldPay;
  }

  // -------- Finance aggregation & enrichment (reuse in findAll/findOne) --------

  protected async aggregateFinanceForTxIds(txIds: string[]) {
    const [debts, payments] = await Promise.all([
      this.debtRepo.find({
        where: { transactionId: In(txIds) },
        withDeleted: true,
      }),
      this.paymentRepo.find({
        where: { transactionId: In(txIds) },
        withDeleted: true,
      }),
    ]);

    const debtByTx = new Map<string, DebtAgg>();
    for (const d of debts) {
      if (!d.transactionId) continue;
      const prev = debtByTx.get(d.transactionId) ?? {
        uzs: 0,
        clientId: d.from ?? undefined,
        dueAt: null,
      };
      const nextDueAt = prev.dueAt ?? null;
      debtByTx.set(d.transactionId, {
        uzs: prev.uzs + (Number(d.amount) || 0),
        clientId: prev.clientId ?? d.from ?? undefined,
        dueAt: nextDueAt,
      });
    }

    const payByTx = new Map<string, PayAgg>();
    for (const p of payments) {
      if (!p.transactionId) continue;
      const amount = Number(p.amount) || 0;
      if (!amount) continue;

      const debtClientId = debtByTx.get(p.transactionId)?.clientId;
      let delta: number | null = null;
      let clientHint = debtClientId ?? p.from ?? undefined;

      if (debtClientId) {
        if (p.from === debtClientId) {
          delta = amount;
        } else if (p.to === debtClientId) {
          delta = -amount;
        }
      } else if (p.from) {
        delta = amount;
      } else if (p.to) {
        delta = -amount;
        clientHint = p.to;
      }

      if (delta === null) continue;

      const prev = payByTx.get(p.transactionId) ?? {
        uzs: 0,
        clientIdHint: clientHint,
      };
      payByTx.set(p.transactionId, {
        uzs: prev.uzs + delta,
        clientIdHint: prev.clientIdHint ?? clientHint,
      });
    }

    const clientIds: string[] = [];
    for (const txId of txIds) {
      const viaDebt = debtByTx.get(txId)?.clientId;
      const viaPay = payByTx.get(txId)?.clientIdHint;
      const cid = viaDebt ?? viaPay;
      if (cid) clientIds.push(cid);
    }

    const clients = clientIds.length
      ? await this.clientRepo.find({
          where: { id: In(Array.from(new Set(clientIds))) },
          withDeleted: true,
        })
      : [];
    const clientMap = new Map(clients.map((c) => [c.id, c]));

    const paidByTx = new Map<string, number>();
    for (const p of payments) {
      if (!p.transactionId) continue;
      const amount = Number(p.amount) || 0;
      if (!amount) continue;
      const txId = p.transactionId;
      const clientId =
        debtByTx.get(txId)?.clientId ?? payByTx.get(txId)?.clientIdHint;
      if (!clientId) continue;
      if (p.from === clientId) {
        paidByTx.set(txId, (paidByTx.get(txId) ?? 0) + amount);
      } else if (p.to === clientId) {
        paidByTx.set(txId, (paidByTx.get(txId) ?? 0) - amount);
      }
    }

    return { debtByTx, payByTx, paidByTx, clientMap };
  }

  protected async enrichProductsForTxIds(txIds: string[]) {
    const txProducts = await this.txProdRepo.find({
      where: { transactionId: In(txIds), isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['product'],
    });

    const missingProdIds = txProducts
      .filter((tp) => !tp.product)
      .map((tp) => tp.productId);
    const missingProducts = missingProdIds.length
      ? await this.productRepo.find({
          where: { id: In(missingProdIds) },
          withDeleted: true,
        })
      : [];
    const missingProductMap = new Map(missingProducts.map((p) => [p.id, p]));

    const tpIds = txProducts.map((tp) => tp.id);
    const tpbList = tpIds.length
      ? await this.txProdBatchRepo.find({
          where: { productId: In(tpIds), isActive: true },
          order: { createdAt: 'ASC' },
          relations: ['productBatch'],
        })
      : [];
    const missingPBIds = tpbList
      .filter((tb) => !tb.productBatch)
      .map((tb) => tb.productBatchId);
    const missingPBs = missingPBIds.length
      ? await this.productBatchRepo.find({
          where: { id: In(missingPBIds) },
          withDeleted: true,
        })
      : [];
    const missingPBMap = new Map(missingPBs.map((b) => [b.id, b]));

    const tpbByTp = new Map<string, TransactionProductBatch[]>();
    for (const b of tpbList) {
      const list = tpbByTp.get(b.productId) ?? [];
      list.push(b);
      tpbByTp.set(b.productId, list);
    }

    const productsByTx = new Map<string, TransactionProductResult[]>();
    for (const tp of txProducts) {
      const batches = (tpbByTp.get(tp.id) ?? []).map((bb) =>
        toTPBResult(
          bb,
          bb.productBatch ??
            (missingPBMap.get(bb.productBatchId) as ProductBatch),
        ),
      );
      const prodEntity =
        tp.product ?? (missingProductMap.get(tp.productId) as Product);
      const tpView = toTPResult(tp, prodEntity, batches);
      const list = productsByTx.get(tp.transactionId) ?? [];
      list.push(tpView);
      productsByTx.set(tp.transactionId, list);
    }

    return productsByTx;
  }

  // ---------- compose final row (shared) ----------
  protected composeTxRow(
    header: Transaction,
    productsByTx: Map<string, TransactionProductResult[]>,
    clientMap: Map<string, Client>,
    financeMaps: {
      debtByTx: Map<string, DebtAgg>;
      payByTx: Map<string, PayAgg>;
      paidByTx: Map<string, number>;
    },
  ): TransactionResult {
    const debt = financeMaps.debtByTx.get(header.id) ?? {
      uzs: 0,
      clientId: undefined,
      dueAt: null,
    };
    const payHint = financeMaps.payByTx.get(header.id) ?? {
      uzs: 0,
      clientIdHint: undefined,
    };

    const paidAmount = Math.max(financeMaps.paidByTx.get(header.id) ?? 0, 0);
    const totalPrice = Number(header.totalSoldPrice ?? 0);

    const originalDebt = debt.uzs;
    const dueAmount = Math.max(totalPrice - paidAmount, 0);

    const finance: TxFinanceSummary = {
      debt: originalDebt,
      paid: paidAmount,
      due: dueAmount,
      
    };

    const clientId = debt.clientId ?? payHint.clientIdHint;
    const client = clientId ? (clientMap.get(clientId) ?? null) : null;

    return toTResult(
      header,
      productsByTx.get(header.id) ?? [],
      client,
      finance,
    );
  }
}



