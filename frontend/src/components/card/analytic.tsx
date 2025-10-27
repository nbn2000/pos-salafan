// components/dashboard/FinanceOverviewCard.tsx
import { useGetStatisticsQuery } from '@/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatQuantity } from '@/lib/utils';
import {
  Banknote,
  Building2,
  Boxes,
  Calendar,
  Factory,
  Package,
  Package2,
  TrendingUp,
  Users,
} from 'lucide-react';
import * as React from 'react';

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full bg-background/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3 px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-sm sm:text-base font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-4 md:px-6">{children}</CardContent>
    </Card>
  );
}

export function StockStatusCard(): JSX.Element {
  const { data, isLoading } = useGetStatisticsQuery(undefined);

  const from = data?.period?.from ? new Date(data.period.from) : null;
  const to = data?.period?.to ? new Date(data.period.to) : null;

  const spendRows = [
    { label: 'Xarajatlar', value: data?.spend?.expenses },
    ...(data?.spend?.workerPayments != null
      ? [{ label: "Ishchi to'lovlari", value: data?.spend?.workerPayments }]
      : []),
    {
      label: 'Jami operatsion',
      value: data?.spend?.totalOperational,
      highlight: true,
    },
  ];

  const grossRows = [
    { label: 'Mahsulotlar', value: data?.grossProfit?.products },
    ...(data?.grossProfit?.rawMaterialsReady != null
      ? [{ label: 'Xomashyo', value: data?.grossProfit?.rawMaterialsReady }]
      : []),
    { label: 'Jami', value: data?.grossProfit?.total, highlight: true },
  ];

  const balanceRows = [
    {
      label: 'Mijozlardan olinadigan',
      value: data?.balances?.receivablesFromClients,
    },
    {
      label: "Ta'minotchilarga to'lanadigan",
      value: data?.balances?.payablesToSuppliers,
    },
  ];

  const stockRows = [
    {
      label: 'Mahsulot (don.)',
      value: data?.stock?.totalProductUnitsAvailable,
      isCount: true,
      icon: <Package className="h-3 w-3 text-muted-foreground" />,
    },
    {
      label: 'Xomashyo (don.)',
      value: data?.stock?.totalRawMaterialUnitsAvailable,
      isCount: true,
      icon: <Package2 className="h-3 w-3 text-muted-foreground" />,
    },
    {
      label: 'Yarim tayyor (don.)',
      value: data?.stock?.totalSemiProductUnitsAvailable,
      isCount: true,
      icon: <Boxes className="h-3 w-3 text-muted-foreground" />,
    },
    {
      label: "Yig'uvchilardagi yarim tayyor (don.)",
      value: data?.stock?.totalSemiProductUnitsInAssemblers,
      isCount: true,
      icon: <Users className="h-3 w-3 text-muted-foreground" />,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Davr:{' '}
              <span className="font-medium text-foreground">
                {from ? from.toLocaleDateString('uz-UZ') : '�'}
              </span>{' '}
              �{' '}
              <span className="font-medium text-foreground">
                {to ? to.toLocaleDateString('uz-UZ') : '�'}
              </span>
            </span>
          </div>
          <h3 className="text-base font-semibold">Umumiy ko'rsatkichlar</h3>
          <p className="text-xs text-muted-foreground">
            Filtrlar:{' '}
            {data?.filters?.onlyProducts
              ? 'faqat mahsulotlar'
              : data?.filters?.onlyRawMaterials
                ? 'faqat xomashyo'
                : 'hammasi'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className={cn(
            'grid gap-4',
            'grid-cols-1 md:grid-cols-2 xl:grid-cols-2'
          )}
        >
          <Section
            title="Operatsion xarajatlar"
            icon={<Banknote className="h-4 w-4 text-red-500" />}
          >
            {spendRows.map((row) => (
              <Row
                key={row.label}
                label={row.label}
                value={isLoading ? undefined : row.value}
                highlight={row.highlight}
              />
            ))}
          </Section>

          <Section
            title="Yalpi foyda"
            icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          >
            {grossRows.map((row) => (
              <Row
                key={row.label}
                label={row.label}
                value={isLoading ? undefined : row.value}
                highlight={row.highlight}
              />
            ))}
          </Section>

          <Section
            title="Balanslar"
            icon={<Building2 className="h-4 w-4 text-indigo-500" />}
          >
            {balanceRows.map((row) => (
              <Row
                key={row.label}
                label={row.label}
                value={isLoading ? undefined : row.value}
              />
            ))}
          </Section>

          <Section
            title="Ombor qoldiqlari"
            icon={<Factory className="h-4 w-4 text-blue-500" />}
          >
            {stockRows.map((row) => (
              <Row
                key={row.label}
                label={row.label}
                value={isLoading ? undefined : row.value}
                isCount={row.isCount}
                icon={row.icon}
              />
            ))}
          </Section>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  highlight,
  isCount,
  icon,
}: {
  label: string;
  value: number | undefined;
  highlight?: boolean;
  isCount?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-base">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className={cn('font-semibold', highlight && 'text-foreground')}>
        {value === undefined
          ? '...'
          : isCount
            ? formatQuantity(value)
            : `${formatQuantity(value)} so'm`}
      </span>
    </div>
  );
}
