import { useGetClientsQuery } from '@/api/clients';
import LogoImg from '/logo.jpg';
import { AddDebtorDialog } from '@/components/sale/components/addDebtor';
import SkeletonRow from '@/components/skeleton/products';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchSelect } from '@/components/ui/search-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatQuantity } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Package,
  Plus,
  Printer,
  User,
  Wallet,
} from 'lucide-react';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useReactToPrint } from 'react-to-print';
import type { DefaultSellPrice, SaleLineItem } from './detail';

/* =========================
 * Turlar
 * ========================= */
type PaymentMethod = 'cash' | 'card';

type Payment = {
  id: string;
  method: PaymentMethod; // UZS
  amount: number; // UZS
};

// API payload — updated to match new backend structure
export type SaleRequest = {
  clientId?: string;
  products: {
    productId: string;
    amount: number;
    soldPrice: number; // per unit
  }[];
  paid: number;
  comment?: string;
};

// UI uchun: per-unit service
type DefaultSellPriceEx = DefaultSellPrice & { serviceCharge?: number };

interface PrintableCardProps {
  currentDate: string;
  loading: boolean;
  handleCheckout: (payload: SaleRequest) => void;

  data: SaleLineItem[];
  totalQuantity: number;
  debtors: string;
  setDebtors: React.Dispatch<React.SetStateAction<string>>;

  isDebtor: number;

  defaultSellPrice: DefaultSellPriceEx[];
  setDefaultSellPrice: React.Dispatch<
    React.SetStateAction<DefaultSellPriceEx[]>
  >;

  payments: Payment[];
  addPayment: () => void;
  removePayment: (id: string) => void;
  updatePayment: (id: string, field: keyof Payment, value: any) => void;
  totalPaid: number;

  success?: boolean;
  onBackToSale?: () => void;
}

const paymentMethodOptions: {
  value: PaymentMethod;
  label: string;
  icon: any;
}[] = [{ value: 'cash', label: 'Tolov', icon: Wallet }];

/* =========================
 *  80mm Chek komponenti (print-only)
 * ========================= */
type ReceiptLine = {
  name: string;
  qty: number;
  unit: number;
  total: number;
  /** e.g. "KG", "PIECE" */
  productType?: string;
};
type ReceiptModel = {
  date: string;
  clientName?: string;
  clientPhone?: string;
  products: ReceiptLine[];
  serviceFeeTotal: number; // xizmat jamisi
  grandTotal: number; // asosiy + xizmat
  paid: number;
  comment?: string;
};

export const Receipt58mm = forwardRef<HTMLDivElement, { model: ReceiptModel }>(
  ({ model }, ref) => {
    const allItems = [...model.products];
    console.log('it is all ai:', allItems);
    return (
      <div ref={ref} className="receipt-58 p-3 my-6 text-[11px] leading-snug">
        <style>{`
@media screen {
  .receipt-58 {
    width: 80mm;
    margin: 0 auto;
    font-family: 'Courier New', monospace;
  }
}

@media print {
  @page { size: 80mm auto; margin: 0 }
  .receipt-58 {
    width: 80mm;
    font-family: 'Courier New', monospace;
    padding-bottom: 12mm;
  }

  .receipt-58::after {
    content: "";
    display: block;
    height: 12mm;
  }

  .cut { page-break-after: always; }
}

img.receipt-logo {
  display: block;
  margin: 0 auto 6px auto;
  max-width: 70mm;
  width: 100%;
  image-rendering: pixelated;
}
        `}</style>

        <img
          src={LogoImg}
          alt="logo"
          className="receipt-logo h-16 object-contain"
        />

        <div className="text-center mb-2">
          <div className="text-base text-black font-bold">SOTUV CHEKI</div>
          <div className="text-black font-semibold text-base">{model.date}</div>
        </div>

        <div className="mb-2">
          <div className="font-semibold text-base text-black">Mijoz:</div>
          <div className="break-words text-black font-semibold text-base">
            {model.clientName ?? '-'}
          </div>
          <div className="text-black font-semibold text-base">
            {model.clientPhone ?? ''}
          </div>
        </div>

        {allItems.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-base text-black">
              Mahsulotlar
            </div>
            <div className="mt-1 space-y-1">
              {allItems.map((item, i) => (
                <div
                  key={i}
                  className="py-1 border-t border-b border-gray-300 text-black text-base px-2"
                >
                  <div className="flex justify-between items-center w-full gap-2">
                    <div className="flex-1 font-semibold break-words leading-snug pr-2 text-black text-[11px]">
                      {item.name}
                    </div>

                    <div className="flex flex-col items-end text-right shrink-0 text-black text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">
                          {formatQuantity(item.qty)}
                        </span>
                        <span>-</span>
                        <span className="font-semibold">
                          {formatQuantity(item.total)} so'm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yakuniy qismlar */}
        <div className="border-t pt-2 mt-2 border-black">
          <div className="flex justify-between text-base">
            <span className="font-bold text-black">Xizmat haqi:</span>
            <span className="font-bold text-black">
              {formatQuantity(model.serviceFeeTotal)} so'm
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-bold text-black">Jami:</span>
            <span className="font-bold text-black">
              {formatQuantity(model.grandTotal)} so'm
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-bold text-black">To'langan:</span>
            <span className="font-bold text-black">
              {formatQuantity(model.paid)} so'm
            </span>
          </div>
          {model.comment && (
            <div className="mt-1 text-base">
              <span className="font-semibold text-black">Izoh: </span>
              <span className="break-words text-black">{model.comment}</span>
            </div>
          )}
        </div>
        <div className="text-center h-2 border-b-2 border-gray-400" />
      </div>
    );
  }
);
Receipt58mm.displayName = 'Receipt58mm';

/* =========================
 *  Asosiy PrintableCard
 * ========================= */
export function PrintableCard({
  success = false,
  onBackToSale,
  currentDate,
  loading,
  handleCheckout,
  data,
  totalQuantity,
  debtors,
  setDebtors,
  isDebtor,
  defaultSellPrice,
  setDefaultSellPrice,
  payments,
  addPayment,
  removePayment,
  updatePayment,
  totalPaid,
}: PrintableCardProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [debtorSearch, setDebtorSearch] = useState('');
  const [comment, setComment] = useState<string>('');


  const { data: debtorsData } = useGetClientsQuery({
    page: 1,
    take: 99999,
    search: debtorSearch,
  });


  const debtorOptions =
    debtorsData?.results?.map((debtor: any) => ({
      id: debtor.id,
      label: `${debtor.name}${debtor?.phone ? ` | ${debtor.phone}` : ''}`,
      value: String(debtor.id),
    })) ?? [];

  const selectedClient = useMemo(() => {
    const found = debtorsData?.results?.find(
      (d: any) => String(d.id) === String(debtors)
    );
    if (found) return { name: found.name, phone: found.phone };
    const opt = debtorOptions.find((o) => o.value === debtors);
    if (opt?.label) {
      const [name, phone] = opt.label.split('|').map((s) => s.trim());
      return { name, phone };
    }
    return { name: `ID: ${debtors || '-'}`, phone: '' };
  }, [debtors, debtorsData, debtorOptions]);

  /* ===== Hisob-kitoblar ===== */
  const getUnitUzs = (item: SaleLineItem) =>
    Number(
      defaultSellPrice.find((p) => p.id === item.id)?.price ??
        item.unitPrice ??
        0
    );

  const getServiceChargePerUnit = (item: SaleLineItem) =>
    Number(defaultSellPrice.find((p) => p.id === item.id)?.serviceCharge ?? 0);

  const baseTotalUzs = useMemo(() => {
    return data
      .filter((row) => row.qty > 0)
      .reduce((sum, row) => sum + row.qty * getUnitUzs(row), 0);
  }, [data, defaultSellPrice]);

  const serviceFeeTotalUzs = useMemo(() => {
    return data
      .filter((row) => row.qty > 0)
      .reduce((sum, row) => sum + row.qty * getServiceChargePerUnit(row), 0);
  }, [data, defaultSellPrice]);

  const computedTotalUzs = useMemo(
    () => baseTotalUzs + serviceFeeTotalUzs,
    [baseTotalUzs, serviceFeeTotalUzs]
  );


  const remaining = useMemo(
    () => computedTotalUzs - totalPaid,
    [computedTotalUzs, totalPaid]
  );


  const mustChooseClient = !debtors;

  /* ===== Payload ===== */
  const buildPayload = (): SaleRequest => {
    const products = data
      .filter((row) => row.kind === 'product' && row.qty > 0)
      .map((row) => {
        const pricePerUnit = getUnitUzs(row);
        return {
          productId: row.id,
          amount: row.qty,
          soldPrice: pricePerUnit,
        };
      });

    const paid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    return {
      clientId: debtors,
      products,
      paid,
      comment,
    };
  };

  /* ===== Chek modeli (print) ===== */
  const buildReceiptModel = (): ReceiptModel => {
    const products: ReceiptLine[] = [];
    data.forEach((row) => {
      if (row.qty <= 0) return;
      const unit = getUnitUzs(row) + getServiceChargePerUnit(row); // per unit (asosiy + xizmat)

      const line: ReceiptLine = {
        name: row.name,
        qty: row.qty,
        unit,
        total: unit * row.qty,
        productType:
          (row as any).type ??
          (row as any).productType ??
          (row as any).unit ??
          undefined,
      };

      products.push(line);
    });
    return {
      date: currentDate,
      clientName: selectedClient.name,
      clientPhone: selectedClient.phone,
      products,
      serviceFeeTotal: serviceFeeTotalUzs,
      grandTotal: computedTotalUzs,
      paid: totalPaid,
      comment,
    };
  };

  const onCheckoutClick = () => {
    if (mustChooseClient) return;
    handleCheckout(buildPayload());
  };

  // react-to-print
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `chek-${new Date().toISOString()}`,
    preserveAfterPrint: false,
  });

  return (
    <Card className="print-card overflow-hidden print:w-full print:max-w-[80mm] print:p-4 print:border print:text-[12px] print:font-mono h-screen flex flex-col">
      <CardHeader className="print-card-header bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50 px-3 md:px-4 py-2 md:py-3 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <div className="space-y-1 w-full">
            <h2 className="text-base md:text-lg font-bold text-primary">
              Sotuv Ma'lumotlari
            </h2>
            <CardDescription className="text-xs md:text-sm font-medium text-muted-foreground">
              Sana: {currentDate}
            </CardDescription>
          </div>
          {success && (
            <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-2 md:p-3 min-w-[120px]">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Sotuv muvaffaqiyatli yakunlandi.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <div className="flex overflow-hidden">
        <CardContent className="print-card-content p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto">
          {/* PRINT KONTENT (yashirin, lekin doim DOM'da) */}
          <div style={{ position: 'absolute', left: -99999, top: 0 }}>
            <Receipt58mm ref={receiptRef} model={buildReceiptModel()} />
          </div>

          {!success && (
            <>
              {/* Mijoz */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Mijoz</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <SearchSelect
                        value={debtors || ''}
                        onValueChange={(value) => setDebtors(String(value) || '')}
                        placeholder="Mijozni tanlang"
                        searchPlaceholder="Ism yoki telefon raqam bo'yicha qidiring"
                        options={debtorOptions}
                        onSearchChange={setDebtorSearch}
                        searchValue={debtorSearch}
                        className={`h-8 md:h-9 ${!debtors ? 'ring-2 ring-red-500/60 rounded-md' : ''}`}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAddOpen(true)}
                      className="h-8 px-2 flex-shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {!debtors && (
                    <div className="text-[11px] text-red-600">
                      Mijoz tanlash majburiy.
                    </div>
                  )}
                </div>
              </div>


              {/* Items jadvali */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Mahsulotlar</h3>
                </div>
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <Table className="w-full">
                      <TableHeader className="bg-muted/30 sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="text-xs text-left font-medium px-4">
                            Nomi
                          </TableHead>
                          <TableHead className="text-xs font-medium text-center px-4">
                            Narxi (UZS)
                          </TableHead>
                          <TableHead className="text-xs font-medium text-center px-4">
                            Xizmat (UZS)
                          </TableHead>
                          <TableHead className="text-xs font-medium text-right px-4">
                            Miqdori
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading
                          ? Array.from({ length: 3 }).map((_, i) => (
                              <SkeletonRow key={i} />
                            ))
                          : data
                              .filter((item) => item.qty > 0)
                              .map((item, index) => {
                                const exist = defaultSellPrice.find(
                                  (p) => p.id === item.id
                                );
                                const shownPrice = Number(
                                  exist?.price ?? item.unitPrice ?? 0
                                );
                                const shownService = exist?.serviceCharge ?? '';
                                return (
                                  <TableRow
                                    key={item.id}
                                    className={
                                      index % 2 === 0
                                        ? 'bg-background'
                                        : 'bg-muted/20'
                                    }
                                  >
                                    <TableCell className="font-medium px-4 w-[80px] md:w-[140px] truncate py-2 md:py-3">
                                      <div
                                        className="truncate text-xs"
                                        title={item.name.trim()}
                                      >
                                        {item.name.trim()}
                                      </div>
                                    </TableCell>

                                    {/* Narxi (UZS) */}
                                    <TableCell className="pl-0 md:pl-1 py-2 md:py-3">
                                      <NumericFormat
                                        value={shownPrice}
                                        onValueChange={({ value }) =>
                                          setDefaultSellPrice((prev) => {
                                            const idx = prev.findIndex(
                                              (p) => p.id === item.id
                                            );
                                            const nextPrice = Number(
                                              value || 0
                                            );
                                            if (idx === -1) {
                                              const base: DefaultSellPriceEx = {
                                                id: item.id,
                                                price: nextPrice,
                                              };
                                              return [...prev, base];
                                            }
                                            const clone: DefaultSellPriceEx[] =
                                              [...prev];
                                            clone[idx] = {
                                              ...clone[idx],
                                              price: nextPrice,
                                            };
                                            return clone;
                                          })
                                        }
                                        allowNegative={false}
                                        thousandSeparator=" "
                                        customInput={Input}
                                        className="max-w-[90px] m-auto text-xs h-8"
                                      />
                                    </TableCell>

                                    {/* Xizmat (UZS) вЂ” per unit (UI) */}
                                    <TableCell className="pl-0 md:pl-1 py-2 md:py-3">
                                      <NumericFormat
                                        value={shownService}
                                        onValueChange={({ value }) =>
                                          setDefaultSellPrice((prev) => {
                                            const idx = prev.findIndex(
                                              (p) => p.id === item.id
                                            );
                                            const nextVal =
                                              value === ''
                                                ? undefined
                                                : Number(value);
                                            if (idx === -1) {
                                              const base: DefaultSellPriceEx = {
                                                id: item.id,
                                                price: Number(
                                                  item.unitPrice ?? 0
                                                ),
                                                serviceCharge: nextVal,
                                              };
                                              return [...prev, base];
                                            }
                                            const clone: DefaultSellPriceEx[] =
                                              [...prev];
                                            clone[idx] = {
                                              ...clone[idx],
                                              serviceCharge: nextVal,
                                            };
                                            if (
                                              typeof clone[idx].price !==
                                              'number'
                                            ) {
                                              clone[idx].price = Number(
                                                item.unitPrice ?? 0
                                              );
                                            }
                                            return clone;
                                          })
                                        }
                                        allowNegative={false}
                                        thousandSeparator=" "
                                        customInput={Input}
                                        className="max-w-[90px] m-auto text-xs h-8"
                                        placeholder="0"
                                      />
                                    </TableCell>

                                    {/* Miqdori */}
                                    <TableCell className="text-right py-2 px-4 md:py-2 font-semibold">
                                      {item.qty}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* To'lov bloki */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">To'lov</h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {paymentMethodOptions.map(({ value, label, icon: Icon }) => {
                    const payment = payments.find((p) => p.method === value);
                    return (
                      <div
                        key={value}
                        className="flex flex-col gap-1 p-2 bg-muted/30 rounded-lg border border-border/50"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-center leading-tight">
                            {label}
                          </span>
                        </div>
                        <div className="flex-1">
                          <NumericFormat
                            placeholder="0"
                            value={payment?.amount ?? ''}
                            onValueChange={({ floatValue }) =>
                              updatePayment(value, 'amount', floatValue || 0)
                            }
                            allowNegative={false}
                            thousandSeparator=" "
                            customInput={Input}
                            className="text-center text-xs h-7 md:h-8"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Umumiy koвЂrsatkichlar (UI) */}
                <div className="bg-muted/20 rounded-lg p-3 space-y-2 border border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Xizmat haqi:</span>
                    <div className="text-right">
                      <span className="font-medium text-sm">
                        {formatQuantity(serviceFeeTotalUzs)} so'm
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Jami:</span>
                    <div className="text-right">
                      <span className="font-bold text-sm">
                        {formatQuantity(computedTotalUzs)} so'm
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">To'langan:</span>
                    <div className="text-right">
                      <span className="font-medium text-sm">
                        {formatQuantity(totalPaid)} so'm
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Qarz:</span>
                    <div className="text-right">
                      <span
                        className={`font-bold text-sm ${
                          remaining > 0
                            ? 'text-red-600'
                            : remaining < 0
                              ? 'text-green-600'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {formatQuantity(Math.abs(remaining))} so'm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Izoh */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Izoh (ixtiyoriy)
                  </label>
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Masalan: Retail sale #123"
                    className="h-9"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-3 md:p-4 flex-shrink-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
        {success ? (
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="h-10 md:h-12 flex-1"
              onClick={() => handlePrint?.()}
            >
              <Printer className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Chop etish
            </Button>
            <Button
              className="h-10 md:h-12 flex-1"
              onClick={() => onBackToSale?.()}
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Sotuvga qaytish
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-10 md:h-12 gap-2 md:gap-3 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg text-sm md:text-base"
            onClick={onCheckoutClick}
            disabled={
              computedTotalUzs === 0 ||
              !debtors
            }
            title={
              !debtors
                ? 'Mijozni tanlang'
                : undefined
            }
          >
            <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
            Sotish
          </Button>
        )}
      </CardFooter>

      <AddDebtorDialog 
        open={addOpen} 
        onClose={() => setAddOpen(false)}
        onClientCreated={(client) => {
          // Auto-select the created client
          setDebtors(client.id);
          setAddOpen(false);
        }}
      />
    </Card>
  );
};
