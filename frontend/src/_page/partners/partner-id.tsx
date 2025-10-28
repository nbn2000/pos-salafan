// pages/suppliers/SupplierDetailPage.tsx
import { UniversalPage } from '@/components/common/UniversalPage';
import { UniversalTable } from '@/components/common/UniversalTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import RootLayout from '@/layout';
import { formatQuantity } from '@/lib/utils';
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Hash,
  Package,
  User,
  Wallet,
  Receipt,
  Clock,
  FileText,
  Banknote,
  Building2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useNavigate, useParams } from 'react-router-dom';

import { useUserData } from '@/hooks/useUserData';
import { useGetPartnersFinanceQuery } from '@/api/partners';
import { DialogPayment } from '@/components/tablecustomers/components/DialogDebt';
import { useAppSelector } from '@/store/hooks';

// ==== Updated types to match backend structure ====
type SupplierFinanceBatchLog = {
  id: string;
  createdAt: string;
  comment?: string | null;
};

type SupplierFinancePayment = {
  id: string;
  createdAt: string;
  amount: number;
  paymentType: 'CASH' | 'CARD' | 'TRANSFER';
  comment?: string;
};

type SupplierFinanceBatch = {
  id: string;
  createdAt: string;
  updatedAt: string;
  rawMaterialId: string;
  rawMaterialName: string;
  amount: number;
  buyPrice: number;
  // finance fields
  credit: number; // variable current due = total - paid
  creditStatic: number; // initial debt at purchase time
  paid: number; // variable total paid to date
  paidStatic: number; // paid at purchase time
  payments: SupplierFinancePayment[];
  logs: SupplierFinanceBatchLog[];
};
type SupplierFinanceMaterial = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  isReady: boolean;
  type: 'KG' | 'METER' | 'LITER';
  warehouseId: string;
  warehouseName: string;
};
type SupplierMaterialFinanceItem = {
  material: SupplierFinanceMaterial;
  credit: number;
  batches: SupplierFinanceBatch[];
};
type SupplierSummary = { id: string; name: string; phone: string };
type SupplierMaterialsFinance = {
  supplier: SupplierSummary;
  credit: number;
  items: SupplierMaterialFinanceItem[];
};

// --- Jadval qatori ---
type NormalizedRow = {
  materialId: string;
  name: string;
  warehouseName: string;
  credit: number;
  batches: SupplierFinanceBatch[];
};

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetPartnersFinanceQuery(id, {
    skip: !id,
  }) as {
    data?: SupplierMaterialsFinance;
    isLoading: boolean;
    isError: boolean;
  };

  const { userData } = useUserData();
  const userId = userData?.user?.id || '';


  const supplier = data?.supplier;

  // items -> NormalizedRow[]
  const rows: NormalizedRow[] = useMemo(() => {
    return (data?.items ?? []).map((it) => {
      const batches = it.batches || [];
      return {
        materialId: String(it.material.id),
        name: it.material.name,
        warehouseName: it.material.warehouseName,
        credit: Number(it.credit || 0),
        batches,
      };
    });
  }, [data]);

  const totalDebtUsd = Number(data?.credit ?? 0);

  const totalAmount = useMemo(
    () =>
      rows.reduce(
        (sum, r) =>
          sum + r.batches.reduce((s, b) => s + Number(b?.amount ?? 0), 0),
        0
      ),
    [rows]
  );

  const debtsCount = rows.length;

  // Row details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<NormalizedRow | null>(null);
  const onRowClick = (row: NormalizedRow) => {
    setSelectedRow(row);
    setDetailsOpen(true);
  };

  // To'lov dialogi (supplier) — DialogPayment UZS bilan hisoblaydi,
  // shuning uchun USD qarzni UZS ga kurs orqali aylantirib yuboramiz.
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{
    supplier_id: string;
    rawMaterialLogId: string;
    totalAmount: number; // UZS
    rate?: number; // so'm / $1  <-- YANGI
  } | null>(null);

  const pickPayableLogId = (r: NormalizedRow): string | undefined => {
    const batchWithDebt =
      r.batches.find((b) => Number(b?.credit ?? 0) > 0) ?? r.batches[0];
    if (!batchWithDebt) return undefined;
    if (batchWithDebt.logs?.length)
      return String(batchWithDebt.logs[batchWithDebt.logs.length - 1].id || '');
    return undefined;
  };

  const startPayment = (row: NormalizedRow) => {
    const rawMaterialLogId = pickPayableLogId(row);
    if (!rawMaterialLogId || !supplier?.id) return;

    const totalAmountUZS = Math.round(row.credit || 0);

    setPendingPayment({
      supplier_id: String(supplier.id),
      rawMaterialLogId,
      totalAmount: totalAmountUZS,
    });
    setPaymentOpen(true);
  };

  // Jadval ustunlari — USD
  const columns = [
    {
      key: 'name',
      header: 'Xomashyo',
      icon: <Hash className="h-4 w-4" />,
      render: (row: NormalizedRow) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium text-sm">{row.name}</span>
          </div>
          <div className="text-[11px] text-muted-foreground ml-5">
            {row.warehouseName}
          </div>
        </div>
      ),
    },
    {
      key: 'debt',
      header: "Qarz SO'M",
      icon: <DollarSign className="h-4 w-4" />,
      render: (row: NormalizedRow) => (
        <span className="font-semibold text-sm text-red-600">
          <NumericFormat
            value={row.credit || 0}
            displayType="text"
            thousandSeparator=" "
            suffix=" so'm"
          />
        </span>
      ),
    },
    {
      key: 'qty',
      header: 'Miqdor',
      icon: <Package className="h-4 w-4" />,
      render: (row: NormalizedRow) => {
        const qty = row.batches.reduce((s, b) => s + Number(b?.amount ?? 0), 0);
        return <span className="font-medium text-sm">{qty}</span>;
      },
    },
    {
      key: 'paymentTypes',
      header: 'To\'lov turlari',
      icon: <Receipt className="h-4 w-4" />,
      render: (row: NormalizedRow) => {
        const paymentTypes = new Set<string>();
        row.batches.forEach(batch => {
          (batch.payments || []).forEach(payment => {
            if (payment.paymentType) {
              paymentTypes.add(payment.paymentType);
            }
          });
        });
        
        const types = Array.from(paymentTypes);
        if (types.length === 0) {
          return <span className="text-xs text-muted-foreground">To'lov yo'q</span>;
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {types.map(type => (
              <Badge 
                key={type} 
                variant="outline" 
                className={`text-xs px-2 py-0.5 ${
                  type === 'CASH' ? 'bg-green-50 text-green-700 border-green-200' :
                  type === 'CARD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  type === 'TRANSFER' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {type === 'CASH' ? 'Naqd' : 
                 type === 'CARD' ? 'Karta' : 
                 type === 'TRANSFER' ? 'O\'tkazma' : type}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Amallar',
      render: (row: NormalizedRow) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              startPayment(row);
            }}
            className="h-8 px-3 text-xs"
            disabled={(row.credit || 0) <= 0}
          >
            <Wallet className="h-3 w-3 mr-1" />
            To'lov
          </Button>
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <RootLayout>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Ma'lumot topilmadi</h2>
          <p className="text-muted-foreground">
            Ta’minotchi ma’lumoti olinmadi
          </p>
          <Button onClick={() => navigate('/partners')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ortga qaytish
          </Button>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <UniversalPage
        header={{
          title: "Ta’minotchi ma'lumotlari",
          description: supplier
            ? `${supplier.name} — ${supplier.phone}`
            : id
              ? `Supplier ID: ${id}`
              : 'Supplier',
          icon: <User className="w-5 h-5 text-primary" />,
          showFullscreen: true,
          actions: (
            <Button
              variant="outline"
              onClick={() => navigate('/partners')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Qaytish
            </Button>
          ),
        }}
        showBreadcrumb
      >
        <div className="space-y-6">
          {/* Summary — USD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  Umumiy qarz
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600">
                <NumericFormat
                  value={totalDebtUsd}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" SO'M"
                />
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  Umumiy miqdor (barcha partiyalar)
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-600">
                {formatQuantity(totalAmount)}
              </div>
            </div>
          </div>

          {/* Debts Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Qarzlar ro'yxati</h2>
              <Badge variant="outline" className="text-sm">
                {debtsCount} ta pozitsiya
              </Badge>
            </div>

            <UniversalTable<NormalizedRow>
              data={rows}
              isLoading={isLoading}
              columns={columns}
              emptyTitle="Qarzlar topilmadi"
              emptyDescription="Bu ta’minotchi bo‘yicha qarzlar mavjud emas"
              emptyIcon={
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              }
              enableHoverEffect
              onRowClick={onRowClick}
            />
          </div>
        </div>
      </UniversalPage>

      {/* To'lov (Supplier, limit UZS’da) */}
      {pendingPayment && (
        <DialogPayment
          userId={userId}
          open={paymentOpen}
          setOpen={setPaymentOpen}
          supplierId={pendingPayment.supplier_id}
          rawMaterialLogId={pendingPayment.rawMaterialLogId}
          totalAmount={pendingPayment.totalAmount} // UZS
        />
      )}

      {/* Row Details Modal — USD va kurs "so'm / 1$" */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {selectedRow?.name} — {selectedRow?.warehouseName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden min-h-0">
            <div className="h-full overflow-y-auto space-y-4">
              {selectedRow && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Jami qarz:</span>{' '}
                      <NumericFormat
                        value={selectedRow.credit || 0}
                        displayType="text"
                        thousandSeparator=" "
                        suffix=" so'm"
                      />
                    </div>
                    <div>
                      <span className="font-medium">Miqdor jami:</span>{' '}
                      {formatQuantity(
                        selectedRow.batches.reduce(
                          (s, b) => s + Number(b?.amount ?? 0),
                          0
                        )
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-6">
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Partiyalar (batches)
                      </h3>
                      <table className="w-full text-sm border rounded-md overflow-hidden">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-2">Batch ID</th>
                            <th className="text-left p-2">Sana</th>
                            <th className="text-right p-2">Miqdor</th>
                            <th className="text-right p-2">To'langan</th>
                            <th className="text-right p-2">Qarz</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRow.batches.map((b) => (
                            <tr key={String(b.id)} className="border-t">
                              <td className="p-2 font-mono text-xs">{b.id}</td>
                              <td className="p-2 text-xs">
                                {new Date(b.createdAt).toLocaleString('uz-UZ')}
                              </td>
                              <td className="p-2 text-right">
                                {formatQuantity(b.amount)}
                              </td>
                              <td className="p-2 text-right">
                                <NumericFormat
                                  value={b.paid || 0}
                                  displayType="text"
                                  thousandSeparator=" "
                                  suffix=" so'm"
                                />
                              </td>
                              <td className="p-2 text-right text-red-600">
                                <NumericFormat
                                  value={b.credit || 0}
                                  displayType="text"
                                  thousandSeparator=" "
                                  suffix=" so'm"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Payment History */}
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        To'lovlar tarixi
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedRow.batches.flatMap((batch) => 
                          (batch.payments || []).map((payment) => (
                            <div key={payment.id} className="border rounded-lg p-3 bg-muted/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {payment.paymentType === 'CASH' ? (
                                    <Banknote className="h-4 w-4 text-green-600" />
                                  ) : payment.paymentType === 'CARD' ? (
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                  ) : payment.paymentType === 'TRANSFER' ? (
                                    <Building2 className="h-4 w-4 text-purple-600" />
                                  ) : (
                                    <Wallet className="h-4 w-4 text-gray-600" />
                                  )}
                                  <span className="font-medium text-sm">
                                    {payment.paymentType === 'CASH' ? 'Naqd pul' : 
                                     payment.paymentType === 'CARD' ? 'Plastik karta' : 
                                     payment.paymentType === 'TRANSFER' ? 'Bank o\'tkazmasi' : 
                                     payment.paymentType || 'Noma\'lum'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-green-600">
                                    <NumericFormat
                                      value={payment.amount}
                                      displayType="text"
                                      thousandSeparator=" "
                                      suffix=" so'm"
                                    />
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(payment.createdAt).toLocaleString('uz-UZ')}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Batch: {batch.rawMaterialName}
                              </div>
                              {payment.comment && (
                                <div className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-l-2 border-blue-400">
                                  <span className="font-medium text-blue-700 dark:text-blue-300">💬 Izoh:</span>
                                  <div className="italic mt-1">"{payment.comment}"</div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                        {selectedRow.batches.every(batch => !batch.payments || batch.payments.length === 0) && (
                          <div className="text-center py-4 text-muted-foreground">
                            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Hech qanday to'lov topilmadi</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activity Logs */}
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Faoliyat jurnali
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedRow.batches.flatMap((batch) => 
                          (batch.logs || []).map((log) => (
                            <div key={log.id} className="border rounded-lg p-3 bg-muted/10">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm">{log.comment || 'Izoh yo\'q'}</p>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(log.createdAt).toLocaleString('uz-UZ')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        {selectedRow.batches.every(batch => !batch.logs || batch.logs.length === 0) && (
                          <div className="text-center py-4 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Hech qanday faoliyat topilmadi</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </RootLayout>
  );
}
