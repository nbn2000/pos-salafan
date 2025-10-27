// ===== Common base types (bor deb qabul qiling) =====
// type UUID = string;
// type ISODateString = string;
// type MeasureType = 'KG' | 'METER' | 'LITER';

declare interface SupplierSummary {
  id: UUID;
  name: string;
  phone: string;
}

declare interface SupplierFinanceMaterial {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name: string;
  isReady: boolean;
  type: MeasureType; // masalan: 'KG'
  warehouseId: UUID;
  warehouseName: string;
}

// ===== NEW: Supplier -> Materials finance (split fields yo‘q) =====

declare interface SupplierMaterialsFinance {
  supplier: SupplierSummary;

  /**
   * Umumiy qarzdorlik (UZS).
   * Aggregatsiya UZSda yuritiladi.
   */
  credit: number;

  items: SupplierMaterialFinanceItem[];
}

declare interface SupplierMaterialFinanceItem {
  material: SupplierFinanceMaterial;

  /**
   * Material bo‘yicha jami qarz (UZS).
   */
  credit: number;

  batches: SupplierFinanceBatch[];
}

declare interface SupplierFinanceBatch {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;

  rawMaterialId: UUID;
  rawMaterialName: string;

  /**
   * Partiya miqdori (material o‘lchov birligida).
   */
  amount: number;

  /**
   * Sotuv narxi (birlik narx).
   * Kiritilgan valyutada bo‘lishi mumkin (UZS yoki USD).
   * UZS ekvivalenti = sellPrice * exchangeRate (agar sellPrice USDda bo‘lsa).
   */
  sellPrice: number;

  /**
   * Xarid narxi (birlik narx).
   * Kiritilgan valyutada bo‘lishi mumkin (UZS yoki USD).
   * UZS ekvivalenti = buyPrice * exchangeRate (agar buyPrice USDda bo‘lsa).
   */
  buyPrice: number;

  /**
   * Kurs (UZS / 1 USD). UZS ekvivalentlarini hisoblash uchun.
   */
  exchangeRate: number;

  /**
   * Partiya bo‘yicha jami summa (UZS).
   * Odatda buyPrice * amount (UZS ekvivalenti).
   */
  total: number;

  /**
   * To‘langan (UZS).
   */
  paid: number;

  /**
   * Qoldiq (UZS).
   */
  due: number;

  /**
   * Qarzdorlik (UZS). (Ko‘pincha total bilan teng bo‘lishi yoki loglar asosida shakllanishi mumkin)
   */
  debt: number;

  logIds: UUID[];
  logs: SupplierFinanceBatchLog[];
}

declare interface SupplierFinanceBatchLog {
  id: UUID;
  createdAt: ISODateString;
  comment: string;

  /**
   * Log kesimidagi qarz va to‘lov (UZS).
   */
  debt: number;
  paid: number;
}
