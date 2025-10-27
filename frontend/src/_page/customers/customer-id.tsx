// pages/debtor/DebtorDetailPage.tsx
import { UniversalPage } from '@/components/common/UniversalPage';
import { UniversalTable } from '@/components/common/UniversalTable';
import { DialogPayment } from '@/components/tablecustomers/components/DialogDebt';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import RootLayout from '@/layout';
import { date, formatQuantity } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  Hash,
  MessageSquareText,
  MessageSquare,
  Package,
  ShoppingCart,
  User,
  Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useNavigate, useParams } from 'react-router-dom';

import { useLazyGetUserDataQuery } from '@/api/auth';
import { useAppSelector } from '@/store/hooks';

// рџ†• Tabs (shadcn)
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Messages API
import { useGetClientFinanceQuery } from '@/api/clients';
import { useGetMessagesQuery } from '@/api/message';
import { SendMessageDialog } from '@/components/customers/SendMessageDialog';

// --- (ixtiyoriy) xabar tipi minimal ---
type MessageRow = {
  id: string;
  text: string;
  toPhone: string;
  status: string;
  createdAt: string;
};

// рџ†• Har bir tranzaksiya uchun qatordagi model (UZS-only)
type TxRow = {
  transactionId: string;
  products: {
    kind: 'product' | 'raw';
    id: string;
    name: string;
    warehouseName: string;
    amount: number; // shu tranzaksiya ichida shu nom boвЂyicha jami miqdor
  }[];
  totalAmount: number; // tranzaksiya boвЂyicha jami miqdor
  totalDue: number; // tranzaksiya boвЂyicha jami qarz (UZS)
  shouldPayDate?: string; // рџ†• ISO 8601
};

// рџ†• helperlar (ranglash va sanani tanlash uchun)
const pickEarliestISO = (arr: (string | undefined)[]) => {
  const dates = arr
    .filter(Boolean)
    .map((iso) => new Date(iso as string))
    .filter((d) => !Number.isNaN(d.getTime()));
  if (!dates.length) return undefined;
  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  return min.toISOString();
};
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export default function DebtorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- Customers finance ---
  const { data, isLoading, isError } = useGetClientFinanceQuery(id!, {
    skip: !id,
  });

  // --- User info (to'lov dialog uchun) ---
  const [userTrigger, { data: userData }] = useLazyGetUserDataQuery();
  const token = useAppSelector((state) => state.auth.token);
  useEffect(() => {
    if (token) userTrigger();
  }, [token, userTrigger]);

  const userId = userData?.user?.id || '';
  const client = data?.client;

  // рџ“Љ Jami qarz (UZS)
  const totalDebtUzs = Number(data?.credit ?? 0);

  // рџ§® items + rawItems ni TRANSAKSIYA kesimida birlashtiramiz (shouldPayDate ham)
  const txRows: TxRow[] = useMemo(() => {
    type BuildRow = {
      itemsByKey: Map<string, TxRow['products'][number]>;
      totalAmount: number;
      totalDue: number;
      shouldPayDates: string[]; // рџ†• har bir line dagi sana yigвЂiladi
    };
    const txMap = new Map<string, BuildRow>();

    const upsert = (
      transactionId: string,
      entry: {
        kind: 'product' | 'raw';
        id: string;
        name: string;
        warehouseName: string;
        amount: number;
        due: number; // UZS
        shouldPayDate?: string;
      }
    ) => {
      if (!txMap.has(transactionId)) {
        txMap.set(transactionId, {
          itemsByKey: new Map(),
          totalAmount: 0,
          totalDue: 0,
          shouldPayDates: [],
        });
      }
      const row = txMap.get(transactionId)!;
      const key = `${entry.kind}:${entry.id}`;
      const existed = row.itemsByKey.get(key);
      if (existed) {
        existed.amount += entry.amount;
      } else {
        row.itemsByKey.set(key, {
          kind: entry.kind,
          id: entry.id,
          name: entry.name,
          warehouseName: entry.warehouseName,
          amount: entry.amount,
        });
      }
      row.totalAmount += entry.amount;
      row.totalDue += entry.due;
      if (entry.shouldPayDate) row.shouldPayDates.push(entry.shouldPayDate);
    };

    // Mahsulotlar (backend response structure)
    (data?.items ?? []).forEach((it: any) => {
      const base = {
        kind: 'product' as const,
        id: String(it.product.id),
        name: it.product.name,
        warehouseName: '', // Backend doesn't provide warehouseName for products
      };
      (it.lines ?? []).forEach((ln: any) => {
        upsert(String(ln.transactionId), {
          ...base,
          amount: Number(ln.amount || 0),
          due: Number(ln.due || 0),
          shouldPayDate: ln.shouldPayDate,
        });
      });
    });

    return Array.from(txMap.entries()).map(([transactionId, v]) => ({
      transactionId,
      products: Array.from(v.itemsByKey.values()),
      totalAmount: v.totalAmount,
      totalDue: v.totalDue,
      shouldPayDate: pickEarliestISO(v.shouldPayDates), // рџ†• eng erta sana
    }));
  }, [data]);

  // KPI
  const transactionsCount = txRows.length;
  const totalSoldAmount = useMemo(
    () => txRows.reduce((s, r) => s + (r.totalAmount || 0), 0),
    [txRows]
  );

  // Row details modal (tranzaksiya boвЂyicha)
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TxRow | null>(null);
  const onRowClick = (row: TxRow) => {
    setSelectedRow(row);
    setDetailsOpen(true);
  };

  // To'lov dialogi
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{
    sale_id: string;
    debtor_id: string;
    totalAmount: number;
  } | null>(null);

  // SMS yuborish dialogi
  const [sendMessageOpen, setSendMessageOpen] = useState(false);

  const startPayment = (row: TxRow) => {
    if (!row?.transactionId || !client?.id) return;
    setPendingPayment({
      sale_id: String(row.transactionId),
      debtor_id: String(client.id),
      totalAmount: Number(row.totalDue || 0),
    });
    setPaymentOpen(true);
  };

  // --- Tranzaksiya jadvali ustunlari ---
  const txColumns = [
    {
      key: 'index',
      header: '#',
      icon: <Hash className="h-4 w-4" />,
      width: '40px',
    },
    {
      key: 'products',
      header: 'Tarkibi',
      icon: <ShoppingCart className="h-4 w-4" />,
      render: (row: TxRow) => (
        <div className="flex flex-col gap-1">
          {row.products.map((p) => (
            <div
              key={`${p.kind}-${p.id}`}
              className="flex items-center gap-2 text-sm"
            >
              {p.kind === 'product' ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <ShoppingCart className="h-3 w-3" />
                  <span className="text-[11px]">mahsulot</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span className="text-[11px]">homashyo</span>
                </span>
              )}
              <span className="font-medium">{p.name}</span>
              <span className="text-[11px] text-muted-foreground"></span>
              <span className="ml-auto text-xs text-blue-600">
                Г— {formatQuantity(p.amount)}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Umumiy miqdor',
      icon: <ShoppingCart className="h-4 w-4" />,
      width: '140px',
      render: (row: TxRow) => (
        <span className="font-semibold text-sm">
          {formatQuantity(row.totalAmount)}
        </span>
      ),
    },
    {
      key: 'totalDue',
      header: 'Umumiy qarz',
      icon: <DollarSign className="h-4 w-4" />,
      width: '200px',
      render: (row: TxRow) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold text-sm text-red-600">
            <NumericFormat
              value={row.totalDue || 0}
              displayType="text"
              thousandSeparator=" "
              suffix=" so'm"
            />
          </span>
        </div>
      ),
    },
    // рџ†• To'lov sanasi ustuni
    {
      key: 'shouldPayDate',
      header: "To'lov sanasi",
      icon: <Calendar className="h-4 w-4" />,
      width: '160px',
      render: (row: TxRow) => {
        if (!row.shouldPayDate)
          return <span className="text-xs text-muted-foreground">вЂ”</span>;
        const dt = new Date(row.shouldPayDate);
        const today = startOfDay(new Date());
        const dueDay = startOfDay(dt);
        const isOverdue = dueDay < today;
        const isToday = dueDay.getTime() === today.getTime();

        const cls = isOverdue
          ? 'text-red-600'
          : isToday
            ? 'text-amber-600'
            : 'text-emerald-700';

        return (
          <span className={`font-semibold text-sm ${cls}`}>
            {date(row.shouldPayDate)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Amallar',
      width: '110px',
      render: (row: TxRow) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            startPayment(row);
          }}
          className="h-8 px-3 text-xs"
          disabled={(row.totalDue || 0) <= 0}
        >
          <Wallet className="h-3 w-3 mr-1" />
          To'lov
        </Button>
      ),
    },
  ];

  // =================== Xabarlar (TAB 2) ===================
  const [msgPage, setMsgPage] = useState(1);
  const take = 6;

  // вљ пёЏ API: GET /messages?clientId=<id>&page=...&take=...
  const { data: messagesData, isLoading: msgsLoading } = useGetMessagesQuery(
    id
      ? {
          page: msgPage,
          take,
          // serverda `clientId` filtri boвЂlishi kerak
          clientId: id,
          sortBy: 'createdAt',
        }
      : { page: 1, take: 6 }
  );

  const messageRows: MessageRow[] =
    messagesData?.results?.map((m: any) => ({
      id: String(m.id),
      text: m.text,
      toPhone: m.toPhone,
      status: m.status,
      createdAt: m.createdAt,
    })) ?? [];

  const msgTotalPages = messagesData?.totalPages ?? 1;

  const msgColumns = [
    {
      key: 'index',
      header: '#',
      icon: <Hash className="h-4 w-4" />,
      width: '40px',
    },
    {
      key: 'text',
      header: 'Matn',
      icon: <MessageSquareText className="h-4 w-4" />,
      render: (r: MessageRow) => (
        <div className="max-w-[520px] truncate" title={r.text}>
          {r.text}
        </div>
      ),
    },
    {
      key: 'toPhone',
      header: 'Telefon',
      render: (r: MessageRow) => <span className="text-sm">{r.toPhone}</span>,
    },
    {
      key: 'status',
      header: 'Holat',
      render: (r: MessageRow) => {
        const color =
          r.status === 'SENT'
            ? 'bg-green-100 text-green-700 border-green-200'
            : r.status === 'FAILED'
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-muted text-foreground';
        return (
          <Badge className={color} variant="outline">
            {r.status}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Sana',
      render: (r: MessageRow) => (
        <span className="text-sm">{date(r.createdAt)}</span>
      ),
    },
  ];

  if (isError) {
    return (
      <RootLayout>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Ma'lumot topilmadi</h2>
          <p className="text-muted-foreground">Qarzdor ma'lumoti olinmadi</p>
          <Button onClick={() => navigate('/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mijozlar ro'yxatiga qaytish
          </Button>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <UniversalPage
        header={{
          title: "Mijoz ma'lumotlari",
          description: client
            ? `${client.name}  ${client.phone}`
            : id
              ? `Mijoz ID: ${id}`
              : 'Mijoz',
          icon: <User className="w-5 h-5 text-primary" />,
          showFullscreen: true,
          actions: (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSendMessageOpen(true)}
                className="flex items-center gap-2"
                disabled={!client}
              >
                <MessageSquare className="h-4 w-4" />
                SMS yuborish
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/customers')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Qaytish
              </Button>
            </div>
          ),
        }}
        showBreadcrumb={true}
      >
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  Umumiy qarz
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600">
                {formatQuantity(totalDebtUzs)} so'm
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  Tranzaksiyalar soni
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-600">
                {transactionsCount}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  Umumiy miqdor
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-indigo-600">
                {formatQuantity(totalSoldAmount)}
              </div>
            </div>
          </div>

          {/* рџ†• Tabs: Tranzaksiyalar | Xabarlar */}
          <Tabs defaultValue="tx" className="w-full">
            <TabsList>
              <TabsTrigger value="tx">Tranzaksiyalar</TabsTrigger>
              <TabsTrigger value="messages">Xabarlar</TabsTrigger>
            </TabsList>

            {/* Tranzaksiyalar */}
            <TabsContent value="tx" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tranzaksiyalar</h2>
                <Badge variant="outline" className="text-sm">
                  {transactionsCount} ta
                </Badge>
              </div>

              <UniversalTable<TxRow>
                data={txRows}
                isLoading={isLoading}
                columns={txColumns}
                emptyTitle="Qarzlar topilmadi"
                emptyDescription="Bu mijoz uchun qarzlar mavjud emas"
                emptyIcon={
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                }
                enableHoverEffect={true}
                onRowClick={onRowClick}
              />
            </TabsContent>

            {/* Xabarlar */}
            <TabsContent value="messages" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Xabarlar</h2>
                <Badge variant="outline" className="text-sm">
                  {(messagesData?.count ?? 0).toLocaleString('uz-UZ')} ta
                </Badge>
              </div>

              <UniversalTable<MessageRow>
                data={messageRows}
                isLoading={msgsLoading}
                columns={msgColumns}
                total_pages={messagesData?.totalPages ?? 1}
                emptyTitle="Xabar topilmadi"
                emptyDescription="Bu mijozga hali xabar yuborilmagan"
                emptyIcon={
                  <MessageSquareText className="h-8 w-8 text-muted-foreground" />
                }
                enableHoverEffect={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      </UniversalPage>

      {/* To'lov (tranzaksiya boвЂyicha) */}
      {pendingPayment && (
        <DialogPayment
          userId={userId}
          open={paymentOpen}
          setOpen={setPaymentOpen}
          saleId={pendingPayment.sale_id}
          clientId={pendingPayment.debtor_id}
          totalAmount={pendingPayment.totalAmount}
        />
      )}

      {/* Tafsilotlar (tranzaksiya boвЂyicha) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Tranzaksiya: {selectedRow?.transactionId}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden min-h-0">
            <div className="h-full overflow-y-auto space-y-4">
              {selectedRow && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Umumiy miqdor:</span>{' '}
                      {formatQuantity(selectedRow.totalAmount)}
                    </div>
                    <div>
                      <span className="font-medium">Umumiy qarz:</span>{' '}
                      <NumericFormat
                        value={selectedRow.totalDue || 0}
                        displayType="text"
                        thousandSeparator=" "
                        suffix=" so'm"
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">To'lov sanasi:</span>{' '}
                      {selectedRow.shouldPayDate
                        ? date(selectedRow.shouldPayDate)
                        : 'вЂ”'}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Tarkibi</h3>
                    <ul className="space-y-2">
                      {selectedRow.products.map((p) => (
                        <li
                          key={`${p.kind}-${p.id}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          {p.kind === 'product' ? (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <ShoppingCart className="h-3 w-3" />
                              <span className="text-[11px]">mahsulot</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Package className="h-3 w-3" />
                              <span className="text-[11px]">homashyo</span>
                            </span>
                          )}
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[11px] text-muted-foreground"></span>
                          <span className="ml-auto text-xs text-blue-600">
                            Г— {formatQuantity(p.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS yuborish dialogi */}
      {client && (
        <SendMessageDialog
          open={sendMessageOpen}
          onClose={() => setSendMessageOpen(false)}
          clientId={client.id}
          clientName={client.name}
          clientPhone={client.phone}
        />
      )}
    </RootLayout>
  );
}
