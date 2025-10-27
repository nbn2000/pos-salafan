// ==== Common aliases ====
declare type UUID = string;

// ==== So'rov davri (backend expects YYYY-MM-DD) ====
declare interface ReportPeriod {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  defaultedToMonth: boolean;
}

// ==== Filtrlar ====
declare interface ReportFilters {
  onlyProducts?: boolean;
  onlyRawMaterials?: boolean;
}

// ==== Xarajatlar (UZS) ====
declare interface SpendBreakdown {
  expenses: number;
  workerPayments: number;
  totalOperational: number;
}

// ==== Yaqqol foyda (UZS) ====
declare interface GrossProfitBreakdown {
  products: number;
  rawMaterialsReady: number;
  total: number;
}

// ==== Qoldiqlar/balans (UZS) ====
declare interface BalancesSnapshot {
  receivablesFromClients: number;
  payablesToSuppliers: number;
}

// ==== Ombor qoldiqlari (miqdor) ====
declare interface StockSnapshot {
  totalProductUnitsAvailable: number;
  totalRawMaterialUnitsAvailable: number;
  totalSemiProductUnitsAvailable: number;
  totalSemiProductUnitsInAssemblers: number;
}

// ==== KPIs API Response (actual backend structure) ====
declare interface KPIsResponse {
  period: {
    from: string;
    to: string;
    defaultedToMonth: boolean;
  };
  stock: {
    rawKg: number;
    rawUnit: number;
    productKg: number;
    productUnit: number;
  };
  totalProfit: number;
  admin: {
    totalDebtFromSuppliers: number;
    totalCreditFromClients: number;
  };
}

// ==== Legacy interface (keeping for backward compatibility) ====
declare interface FinanceOverviewResponse {
  period: ReportPeriod;
  filters: ReportFilters;
  spend: SpendBreakdown;
  grossProfit: GrossProfitBreakdown;
  balances: BalancesSnapshot;
  stock: StockSnapshot;
}
