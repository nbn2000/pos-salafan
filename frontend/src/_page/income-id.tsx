// pages/records/RecordDetail.tsx (yoki sizdagi route fayli)
import { UniversalPage } from '@/components/common/UniversalPage';
import { UniversalTable } from '@/components/common/UniversalTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'react-toastify';
import RootLayout from '@/layout';
import { date, formatQuantity } from '@/lib/utils';
import {
  ArrowLeft,
  DollarSign,
  Hash,
  Package,
  Phone,
  User,
  Undo2,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useNavigate, useParams } from 'react-router-dom';

// RTK: 1 ta sotuvni olish (hook nomini loyihangizga moslang)
import { useLazyGetSaleByIdQuery, useRevertTransactionMutation } from '@/api/sales';

// ---- Yangi GET sale-by-id tipining minimal versiyasi (faqat ishlatiladigan maydonlar) ----
type BatchLite = {
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
};

type ProductBatchWrap = BatchLite & {
  productBatch: { id: string; amount: number; sellPrice: number; cost: number };
};

type ProductLine = {
  id: string;
  createdAt: string;
  updatedAt: string;
  soldPrice: number; // per-unit UZS
  product: {
    id: string;
    name: string;
  };
  batches: ProductBatchWrap[];
};

type SaleFinance = { debt: number; paid: number; due: number };

type SaleGetById = {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalSoldPrice: number; // UZS (jami)
  products: ProductLine[];
  comment?: string;
  isReversed?: boolean;
  reversedAt?: string | null;
  client?: { id: string; name: string; phone?: string | null };
  finance: SaleFinance;
};

// ---- Help: miqdor va summalarni xavfsiz hisoblash ----
const sumQtyFromBatches = (batches: Array<{ amount: number }> = []) =>
  batches.reduce<number>((s, b) => s + Number(b?.amount ?? 0), 0);

export default function RecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false);

  const [trigger, { data, isLoading }] = useLazyGetSaleByIdQuery();
  const [revertTransaction, { isLoading: isReverting }] = useRevertTransactionMutation();
  const sale = data as SaleGetById | undefined;

  useEffect(() => {
    if (id) trigger(id); // <-- id as string
  }, [id, trigger]);

  const handleRevert = async () => {
    if (!id || !sale) return;
    
    try {
      await revertTransaction(id).unwrap();
      toast.success('Tranzaksiya muvaffaqiyatli bekor qilindi!');
      setIsRevertDialogOpen(false);
      // Refresh the data
      trigger(id);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Tranzaksiyani bekor qilishda xatolik yuz berdi';
      toast.error(errorMessage);
    }
  };

  // Mahsulot va Homashyo jadval qator turlari
  type ProductRow = {
    id: string;
    name: string;
    unitCostUzs: number;
    unitPriceUzs: number;
    qty: number;
    totalCostUzs: number;
    totalUzs: number;
    profitUzs: number;
  };

  // Mahsulotlar jadval ma'lumotlari
  const productRows = useMemo<ProductRow[]>(() => {
    const lines = sale?.products ?? [];
    return lines.map((p) => {
      const qty = sumQtyFromBatches(p.batches);
      const unitSellPrice = Number(p.soldPrice || 0);
      
      // Calculate weighted average cost from batches
      const totalCost = p.batches.reduce((sum, batch) => {
        const batchCost = Number(batch.productBatch?.cost || 0);
        const batchAmount = Number(batch.amount || 0);
        return sum + (batchCost * batchAmount);
      }, 0);
      
      const unitCost = qty > 0 ? totalCost / qty : 0;
      const totalSellPrice = unitSellPrice * qty;
      const profit = totalSellPrice - totalCost;
      
      return {
        id: p.id,
        name: p.product?.name ?? '—',
        unitCostUzs: unitCost,
        unitPriceUzs: unitSellPrice,
        qty,
        totalCostUzs: totalCost,
        totalUzs: totalSellPrice,
        profitUzs: profit,
      };
    });
  }, [sale]);

  // KPI'lar
  const totalSold = Number(sale?.totalSoldPrice ?? 0);
  const paid = Number(sale?.finance?.paid ?? 0);
  const due = Number(sale?.finance?.due ?? Math.max(totalSold - paid, 0));
  
  // Cost and profit calculations
  const totalCost = productRows.reduce((sum, row) => sum + row.totalCostUzs, 0);
  const totalProfit = productRows.reduce((sum, row) => sum + row.profitUzs, 0);

  // Jadval ustunlari (UZB UI)
  const productColumns = [
    {
      key: 'name' as keyof ProductRow,
      header: 'Mahsulot nomi',
      icon: <Package className="h-4 w-4 text-primary" />,
    },
    {
      key: 'unitCostUzs' as keyof ProductRow,
      header: 'Tannarx (dona)',
      icon: <DollarSign className="h-4 w-4 text-orange-600" />,
      width: '140px',
      render: (r: ProductRow) => (
        <div className="text-orange-600">
          <NumericFormat
            value={r.unitCostUzs}
            displayType="text"
            thousandSeparator=" "
            suffix=" so'm"
          />
        </div>
      ),
    },
    {
      key: 'unitPriceUzs' as keyof ProductRow,
      header: 'Sotuv narx (dona)',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      width: '140px',
      render: (r: ProductRow) => (
        <NumericFormat
          value={r.unitPriceUzs}
          displayType="text"
          thousandSeparator=" "
          suffix=" so'm"
        />
      ),
    },
    {
      key: 'qty' as keyof ProductRow,
      header: 'Miqdor',
      icon: <Hash className="h-4 w-4 text-primary" />,
      width: '110px',
      render: (r: ProductRow) => (
        <span className="font-semibold">{formatQuantity(r.qty)}</span>
      ),
    },
    {
      key: 'totalCostUzs' as keyof ProductRow,
      header: 'Jami tannarx',
      icon: <DollarSign className="h-4 w-4 text-orange-600" />,
      width: '140px',
      render: (r: ProductRow) => (
        <div className="text-orange-600">
          <NumericFormat
            value={r.totalCostUzs}
            displayType="text"
            thousandSeparator=" "
            suffix=" so'm"
          />
        </div>
      ),
    },
    {
      key: 'totalUzs' as keyof ProductRow,
      header: 'Jami sotuv',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      width: '140px',
      render: (r: ProductRow) => (
        <span className="font-semibold">
          <NumericFormat
            value={r.totalUzs}
            displayType="text"
            thousandSeparator=" "
            suffix=" so'm"
          />
        </span>
      ),
    },
    {
      key: 'profitUzs' as keyof ProductRow,
      header: 'Foyda',
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      width: '140px',
      render: (r: ProductRow) => (
        <div className={`font-semibold ${r.profitUzs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <NumericFormat
            value={r.profitUzs}
            displayType="text"
            thousandSeparator=" "
            suffix=" so'm"
          />
        </div>
      ),
    },
  ];

  return (
    <RootLayout>
      <UniversalPage
        header={{
          title: `Sotuv #${sale?.id ?? '...'}${sale?.isReversed ? ' (Bekor qilingan)' : ''}`,
          description: sale?.createdAt
            ? `Sana: ${date(sale.createdAt)}${sale?.isReversed && sale?.reversedAt ? ` • Bekor qilingan: ${date(sale.reversedAt)}` : ''}`
            : 'Sana: —',
          icon: <Hash className="w-5 h-5 text-primary" />,
          actions: (
            <div className="flex items-center gap-2">
              {sale?.isReversed && (
                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                  <Undo2 className="h-3 w-3 mr-1" />
                  Bekor qilingan
                </Badge>
              )}
              {sale && !sale.isReversed && (
                <AlertDialog open={isRevertDialogOpen} onOpenChange={setIsRevertDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-9"
                      disabled={isReverting}
                    >
                      <Undo2 className="w-4 h-4 mr-2" />
                      Bekor qilish
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Tranzaksiyani bekor qilish
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          Ushbu tranzaksiyani bekor qilmoqchimisiz? Bu amal:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Mahsulot miqdorlarini omborga qaytaradi</li>
                          <li>To'lovlar va qarzlarni bekor qiladi</li>
                          <li>Bu amalni qaytarib bo'lmaydi</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRevert}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isReverting}
                      >
                        {isReverting ? 'Bekor qilinmoqda...' : 'Ha, bekor qilish'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="h-9"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ortga
              </Button>
            </div>
          ),
        }}
        showBreadcrumb
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className=" text-muted-foreground">SO'M</span>
                Jami sotuv
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <NumericFormat
                  value={totalSold}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" so'm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className=" text-green-600">SO'M</span>
                To'langan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                <NumericFormat
                  value={paid}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" so'm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className=" text-red-600">SO'M</span>
                Qarz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${due > 0 ? 'text-red-600' : 'text-muted-foreground'}`}
              >
                <NumericFormat
                  value={due}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" so'm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className=" text-orange-600">SO'M</span>
                Tannarx
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                <NumericFormat
                  value={totalCost}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" so'm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className={totalProfit >= 0 ? " text-green-600" : " text-red-600"}>SO'M</span>
                Foyda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <NumericFormat
                  value={totalProfit}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" so'm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mijoz ma'lumotlari */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Mijoz
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {sale?.client ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">{sale.client.name}</span>
                {sale.client.phone && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {sale.client.phone}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">
                Naqd mijoz (ma'lumot yo'q)
              </span>
            )}
          </CardContent>
        </Card>

        {/* Mahsulotlar jadvali */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Mahsulotlar ({productRows.length} ta)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UniversalTable<ProductRow>
              data={productRows}
              columns={productColumns}
              isLoading={isLoading}
              total_pages={1}
              emptyTitle="Mahsulotlar yo'q"
              emptyDescription="Bu sotuv bo'yicha mahsulot topilmadi"
              emptyIcon={<Package className="h-8 w-8 text-muted-foreground" />}
              enableHoverEffect={false}
            />
          </CardContent>
        </Card>
      </UniversalPage>
    </RootLayout>
  );
}
