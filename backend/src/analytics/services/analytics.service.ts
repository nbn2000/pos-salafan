import { Injectable } from '@nestjs/common';
import { AnalyticsBaseQueryDto } from '../dto/analytics-range.dto';

import {
  endOfDayUTC,
  endOfTodayUTC,
  startOfCurrentMonthUTC,
  startOfDayUTC,
} from '../helper';

import { AnalyticsBalancesService } from './analytics-balances.service';
import { AnalyticsGrossProfitService } from './analytics-gross-profit.service';
import { AnalyticsStockService } from './analytics-stock.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly gpSvc: AnalyticsGrossProfitService,
    private readonly balSvc: AnalyticsBalancesService,
    private readonly stockSvc: AnalyticsStockService,
  ) {}

  /**
   * KPIs:
   * - Stock: raw and product amounts split by measurement type (KG, UNIT).
   * - Profit: sum over sold items of amount * (price - cost).
   * - Admin balances: payables to suppliers and receivables from clients.
   */
  async kpis(query: AnalyticsBaseQueryDto) {
    // Period defaults to month-to-date when not provided
    const from = startOfDayUTC(query.createdFrom) ?? startOfCurrentMonthUTC();
    const to = endOfDayUTC(query.createdTo) ?? endOfTodayUTC();

    // Stock snapshots by measurement type (current, not filtered by period)
    const [rawStock, productStock] = await Promise.all([
      this.stockSvc.rawStockByType(),
      this.stockSvc.productStockByType(),
    ]);

    // Period-based profit
    const totalProfit = await this.gpSvc.grossProfitProducts(from, to);

    // Balances (current, not period-limited)
    const [totalCreditFromClients, totalDebtFromSuppliers] = await Promise.all([
      this.balSvc.receivablesFromClients(),
      this.balSvc.payablesToSuppliers(),
    ]);

    return {
      period: {
        from,
        to,
        defaultedToMonth: !query.createdFrom && !query.createdTo,
      },

      // 1) Stock (split by type)
      stock: {
        rawKg: rawStock.kg,
        rawUnit: rawStock.unit,
        productKg: productStock.kg,
        productUnit: productStock.unit,
      },

      // 2) Profit (sum over sold items: amount * (price - cost))
      totalProfit,

      // 3) Admin balances
      admin: {
        totalDebtFromSuppliers,
        totalCreditFromClients,
      },
    };
  }
}

