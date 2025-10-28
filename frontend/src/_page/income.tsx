// pages/records/Records.tsx
import { useGetSalesQuery } from '@/api/sales';
import { UniversalPage } from '@/components/common/UniversalPage';
import { UniversalTable } from '@/components/common/UniversalTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePeriodSelector } from '@/components/records';
import RootLayout from '@/layout';
import { formatQuantity, date } from '@/lib/utils';
import {
  ChevronRight,
  DollarSign,
  Hash,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  User,
  MessageSquare,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Undo2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Updated types to match actual backend response
type ProductBatch = {
  id: string;
  amount: number;
  productBatch: {
    id: string;
    amount: number;
    sellPrice: number;
    isActive: boolean;
    deletedAt?: string | null;
  };
};

type ProductEntryLite = {
  id: string;
  soldPrice: number;
  serviceCharge: number;
  product: {
    id: string;
    name: string;
  };
  batches: ProductBatch[];
};

type SaleTxLite = {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalSoldPrice: number;
  products: ProductEntryLite[];
  comment?: string | null;
  isReversed?: boolean;
  reversedAt?: string | null;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  finance: {
    debt: number;
    paid: number;
    due: number;
    shouldPayDate?: string | null;
  };
};

type SortOrder = 'ASC' | 'DESC';

type Row = {
  txId: string;
  productNames: string[];
  clientName: string;
  clientPhone: string;
  qty: number;
  totalUzs: number;
  comment: string;
  createdAt: string;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  debt: number;
  paid: number;
  due: number;
  shouldPayDate?: string | null;
  serviceCharge: number;
  isReversed?: boolean;
  reversedAt?: string | null;
};

export default function Records() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter state
  const [showFilters, setShowFilters] = useState(false);

  // Query parameters matching backend TransactionQueryDto
  const pageNumber = Number(searchParams.get('page') || '1');
  const take = Number(searchParams.get('take') || '6');
  const q = searchParams.get('q') || ''; // Free-text search
  const clientId = searchParams.get('clientId') || '';
  const productId = searchParams.get('productId') || '';
  const createdFrom = searchParams.get('createdFrom') || '';
  const createdTo = searchParams.get('createdTo') || '';
  const sortBy =
    (searchParams.get('sortBy') as 'createdAt' | 'totalSoldPrice') ||
    'createdAt';
  const sortDir = (searchParams.get('sortDir') as 'ASC' | 'DESC') || 'DESC';

  const { data, isLoading } = useGetSalesQuery({
    page: pageNumber,
    take,
    q: q || undefined,
    clientId: clientId || undefined,
    productId: productId || undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    sortBy: sortBy as any,
    sortDir,
  });

  const list = (data?.results ?? []) as TransactionResult[];
  const totalPages = data?.totalPages ?? 1;

  const rows = useMemo<Row[]>(() => {
    return list.map((tx: TransactionResult) => {
      const clientName = tx.client?.name ?? '—';
      const clientPhone = tx.client?.phone ?? '';

      const productNames = (tx.products ?? [])
        .map((p) => p.product?.name ?? '')
        .filter(Boolean);

      // Calculate total quantity from product batches
      const qty = (tx.products ?? []).reduce<number>(
        (sum: number, p: TransactionProductResult) =>
          sum +
          (p.batches ?? []).reduce<number>(
            (s: number, b: TransactionProductBatchResult) => s + Number(b?.amount ?? 0),
            0
          ),
        0
      );

      // Calculate total service charge (not available in TransactionProductResult)
      const serviceCharge = 0;

      // Determine payment status
      const finance = tx.finance;
      let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
      if (finance.due <= 0) {
        paymentStatus = 'paid';
      } else if (finance.paid > 0) {
        paymentStatus = 'partial';
      }

      return {
        txId: String(tx.id),
        productNames,
        clientName,
        clientPhone,
        qty,
        totalUzs: Number(tx.totalSoldPrice ?? 0),
        comment: tx.comment ?? '',
        createdAt: tx.createdAt,
        paymentStatus,
        debt: Number(finance.debt ?? 0),
        paid: Number(finance.paid ?? 0),
        due: Number(finance.due ?? 0),
        shouldPayDate: (finance as any)?.shouldPayDate,
        serviceCharge,
        isReversed: tx.isReversed,
        reversedAt: tx.reversedAt,
      };
    });
  }, [list]);

  const totalSoldUzs = useMemo<number>(
    () =>
      (list ?? []).reduce<number>(
        (s: number, r: TransactionResult) => s + Number(r?.totalSoldPrice ?? 0),
        0
      ),
    [list]
  );
  const salesCount = list.length;
  const totalDebtUzs = useMemo<number>(
    () =>
      (list ?? []).reduce<number>(
        (s: number, r: TransactionResult) => s + Number(r?.finance?.debt ?? 0),
        0
      ),
    [list]
  );

  const totalPaidUzs = useMemo<number>(
    () =>
      (list ?? []).reduce<number>(
        (s: number, r: TransactionResult) => s + Number(r?.finance?.paid ?? 0),
        0
      ),
    [list]
  );

  const totalDueUzs = useMemo<number>(
    () =>
      (list ?? []).reduce<number>(
        (s: number, r: TransactionResult) => s + Number(r?.finance?.due ?? 0),
        0
      ),
    [list]
  );
  const totalQty = useMemo<number>(
    () => rows.reduce<number>((s: number, r: Row) => s + Number(r.qty ?? 0), 0),
    [rows]
  );

  const updateParams = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v == null) next.delete(k);
      else next.set(k, String(v));
    });
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams({ page: '1', take: String(take) }));
  };

  const handleFiltersChange = (filters: {
    q?: string;
    clientId?: string;
    productId?: string;
    sortBy?: 'createdAt' | 'totalSoldPrice';
    sortDir?: 'ASC' | 'DESC';
    createdFrom?: string;
    createdTo?: string;
  }) => {
    updateParams(filters);
  };

  const handleDateRangeChange = (dates: { createdFrom?: string; createdTo?: string }) => {
    updateParams(dates);
  };

  const hasActiveFilters = q || clientId || productId || createdFrom || createdTo;

  const columns = [
    {
      key: 'index',
      header: '#',
      icon: <Hash className="h-4 w-4 text-primary" />,
      width: '60px',
    },
    {
      key: 'composition' as const,
      header: 'Tarkib va Mijoz',
      icon: <ShoppingCart className="h-4 w-4 text-primary" />,
      render: (r: Row) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] border bg-blue-50 text-blue-700">
              mahsulot
            </span>
            <span className="font-medium text-sm">
              {r.productNames.length ? r.productNames.join(', ') : '—'}
            </span>
            {r.isReversed && (
              <Badge
                variant="destructive"
                className="bg-red-100 text-red-800 border-red-200 text-[10px] px-1 py-0"
              >
                <Undo2 className="h-2 w-2 mr-1" />
                Bekor qilingan
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {r.clientName}
            </span>
            {r.clientPhone && (
              <span className="text-xs text-muted-foreground">
                ({r.clientPhone})
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'comment' as const,
      header: 'Izoh',
      icon: <MessageSquare className="h-4 w-4 text-primary" />,
      width: '200px',
      render: (r: Row) => (
        <div className="max-w-[180px]">
          {r.comment ? (
            <div className="text-sm truncate" title={r.comment}>
              {r.comment}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Izoh yo'q</span>
          )}
        </div>
      ),
    },
    {
      key: 'qty' as keyof Row,
      header: 'Miqdor',
      icon: <ShoppingBag className="h-4 w-4 text-primary" />,
      width: '100px',
      render: (r: Row) => (
        <span className="text-sm font-semibold">{formatQuantity(r.qty)}</span>
      ),
    },
    {
      key: 'payment' as const,
      header: "To'lov holati",
      icon: <CreditCard className="h-4 w-4 text-primary" />,
      width: '200px',
      render: (r: Row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {r.paymentStatus === 'paid' && (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 border-green-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                To'langan
              </Badge>
            )}
            {r.paymentStatus === 'partial' && (
              <Badge
                variant="default"
                className="bg-yellow-100 text-yellow-800 border-yellow-200"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Qisman
              </Badge>
            )}
            {r.paymentStatus === 'unpaid' && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                To'lanmagan
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            To'langan: {formatQuantity(r.paid)} so'm
            {r.due > 0 && (
              <div className="text-red-600">
                Qarz: {formatQuantity(r.due)} so'm
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'totalUzs' as keyof Row,
      header: 'Jami narx',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      width: '150px',
      render: (r: Row) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold text-sm">
            <NumericFormat
              value={r.totalUzs}
              displayType="text"
              thousandSeparator=" "
              suffix=" so'm"
            />
          </span>
          {r.serviceCharge > 0 && (
            <span className="text-xs text-muted-foreground">
              +{formatQuantity(r.serviceCharge)} xizmat
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dates' as const,
      header: 'Sanalar',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      width: '160px',
      render: (r: Row) => (
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground">
            Yaratilgan: {date(r.createdAt)}
          </div>
          {r.isReversed && r.reversedAt && (
            <div className="text-xs">
              <span className="text-muted-foreground">Bekor qilingan: </span>
              <span className="font-medium text-red-600">
                {date(r.reversedAt)}
              </span>
            </div>
          )}
          {r.shouldPayDate && !r.isReversed && (
            <div className="text-xs">
              <span className="text-muted-foreground">To'lov: </span>
              <span
                className={`font-medium ${
                  new Date(r.shouldPayDate) < new Date() && r.due > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {date(r.shouldPayDate)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '40px',
      render: () => <ChevronRight className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <RootLayout>
      <UniversalPage
        header={{
          title: 'Sotuvlar tarixi',
          description:
            'Har qator — bitta sotuv. Tarkibda mahsulot va homashyo nomlari toliq korsatiladi.',
          search: {
            value: q,
            placeholder: "Mijoz, mahsulot yoki izoh bo'yicha qidirish...",
          },
          additionalControls: (
            <TimePeriodSelector
              createdFrom={createdFrom}
              createdTo={createdTo}
              onDateRangeChange={handleDateRangeChange}
              isLoading={isLoading}
            />
          ),
          icon: <DollarSign />,
        }}
        filters={{
          showFilterIcon: true,
          showFilter: showFilters,
          onShowFilterChange: setShowFilters,
          onClearFilters: clearFilters,
          sortField: {
            value: sortBy,
            onValueChange: (value) => handleFiltersChange({ sortBy: value as 'createdAt' | 'totalSoldPrice' }),
            placeholder: 'Saralash maydonini tanlang',
            options: [
              { id: 'createdAt', label: 'Yaratilgan sana', value: 'createdAt' },
              { id: 'totalSoldPrice', label: 'Jami narx', value: 'totalSoldPrice' },
            ],
          },
          sortOrder: {
            value: sortDir,
            onValueChange: (value) => handleFiltersChange({ sortDir: value as 'ASC' | 'DESC' }),
            placeholder: 'Saralash tartibini tanlang',
          },
          customFilters: (
            <div className="space-y-6">
              {/* Custom Date Range Section */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Maxsus vaqt oralig'i
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Boshlanish sanasi
                    </label>
                    <DatePicker
                      value={createdFrom || null}
                      onChange={(value) => handleDateRangeChange({ createdFrom: value || undefined, createdTo })}
                      placeholder="Sana tanlang"
                      disabled={isLoading}
                      maxDate={createdTo ? new Date(createdTo) : undefined}
                      className="h-10 w-full text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Tugash sanasi
                    </label>
                    <DatePicker
                      value={createdTo || null}
                      onChange={(value) => handleDateRangeChange({ createdFrom, createdTo: value || undefined })}
                      placeholder="Sana tanlang"
                      disabled={isLoading}
                      minDate={createdFrom ? new Date(createdFrom) : undefined}
                      className="h-10 w-full text-sm"
                    />
                  </div>
                </div>
                {(createdFrom || createdTo) && (
                  <div className="text-xs text-muted-foreground">
                    Tanlangan: {createdFrom && createdTo
                      ? `${new Date(createdFrom).toLocaleDateString('uz-UZ')} - ${new Date(createdTo).toLocaleDateString('uz-UZ')}`
                      : createdFrom
                      ? `${new Date(createdFrom).toLocaleDateString('uz-UZ')} dan`
                      : `${new Date(createdTo!).toLocaleDateString('uz-UZ')} gacha`
                    }
                  </div>
                )}
              </div>

              {/* ID Filters Section */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-foreground">
                  Aniq ID bo'yicha filtr
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Mijoz ID
                    </label>
                    <input
                      placeholder="433cadec-7fd6-487a-bfda-b957be6c696c"
                      value={clientId}
                      onChange={(e) => handleFiltersChange({ clientId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Mahsulot ID
                    </label>
                    <input
                      placeholder="857f839e-84ca-46d1-bc45-ef1984e137e2"
                      value={productId}
                      onChange={(e) => handleFiltersChange({ productId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          ),
        }}
        showBreadcrumb={true}
      >

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jami sotilgan narx
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <NumericFormat
                  value={totalSoldUzs}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" so'm"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To'langan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                <NumericFormat
                  value={totalPaidUzs}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" so'm"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Qarz (to'lanmagan)
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                <NumericFormat
                  value={totalDueUzs}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" so'm"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sotuvlar soni
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatQuantity(salesCount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami miqdor</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatQuantity(totalQty)}
              </div>
            </CardContent>
          </Card>
        </div>

        <UniversalTable<Row>
          data={rows}
          isLoading={isLoading}
          columns={columns}
          total_pages={totalPages}
          emptyTitle="Sotuvlar topilmadi"
          emptyDescription="Qidiruv/filtrlar bo‘yicha natija yo‘q"
          emptyIcon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
          enableHoverEffect
          onRowClick={(row) => navigate(`/records/${row.txId}`)}
        />
      </UniversalPage>
    </RootLayout>
  );
}
