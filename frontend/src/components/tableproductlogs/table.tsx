import React, { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { UniversalPage } from '@/components/common/UniversalPage';
import { UniversalTable } from '@/components/common/UniversalTable';
import SkeletonRow from '@/components/skeleton/products';
import { Package, Calendar, Tag, Hash } from 'lucide-react';
import { useGetProductLogsQuery } from '@/api/products/product-log';
import { date, formatQuantity } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const PAGE_SIZE = 6;

type ProductLogRow = ProductStockLog;

export default function TableProductLogs() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const parsedPage = Number(searchParams.get('page'));
  const pageNumber =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = (searchParams.get('search') || '').trim();
  const debounced = useDebounce(search, 400);
  const { data, isLoading } = useGetProductLogsQuery({
    page: pageNumber,
    take: PAGE_SIZE,
    search: debounced || undefined,
    sortField: 'createdAt',
    sortOrder: 'DESC',
  });

  const rows: ProductLogRow[] = useMemo(() => (data?.results ?? []) as ProductLogRow[], [data?.results]);

  const pageSize = data?.take && data.take > 0 ? data.take : PAGE_SIZE;

  const rowNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, index) => {
      map.set(row.id, (pageNumber - 1) * pageSize + index + 1);
    });
    return map;
  }, [rows, pageNumber, pageSize]);

  const [detailItem, setDetailItem] = useState<ProductLogRow | null>(null);

  // no badge UI for simplicity; mirrors Raw Material log table

  const columns = [
    {
      key: 'order',
      header: 'No.',
      icon: <Hash className="h-4 w-4 text-primary" />,
      width: '64px',
      render: (row: ProductLogRow) => (
        <span className="font-medium text-foreground">
          {`#${rowNumberMap.get(row.id) ?? '?'}`}
        </span>
      ),
    },
    {
      key: 'productName' as keyof ProductLogRow,
      header: 'Mahsulot',
      icon: <Package className="h-4 w-4 text-primary" />,
      render: (row: ProductLogRow) => (
        <span className="font-medium">{row.productName}</span>
      ),
    },
    {
      key: 'productBatchId' as keyof ProductLogRow,
      header: 'Partiya',
      icon: <Tag className="h-4 w-4 text-primary" />,
      render: (row: ProductLogRow) => (
        <span className="text-xs text-muted-foreground">{row.productBatchId ?? '-'}</span>
      ),
    },
    {
      key: 'amount' as keyof ProductLogRow,
      header: 'Miqdor',
      icon: <Package className="h-4 w-4 text-primary" />,
      render: (row: ProductLogRow) => (
        <span className="font-semibold text-sm">{formatQuantity(row.amount)}</span>
      ),
    },
    {
      key: 'comment' as any,
      header: 'Izoh',
      icon: <Tag className="h-4 w-4 text-primary" />,
      render: (row: ProductLogRow) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {row.comment || '-'}
        </span>
      ),
    },
    {
      key: 'createdAt' as keyof ProductLogRow,
      header: 'Sana',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      width: '140px',
      render: (row: ProductLogRow) => (
        <span>{date(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <>
      <UniversalPage
        header={{
          title: 'Mahsulot loglari',
          description: 'Mahsulotlar kirdi-chiqdi tarixlari',
          search: { value: search, placeholder: 'Qidirish...' },
          icon: <Package />,
        }}
        showBreadcrumb
      >
        <UniversalTable<ProductLogRow>
          data={rows}
          isLoading={isLoading}
          total_pages={data?.totalPages ?? 1}
          columns={columns}
          emptyTitle="Loglar topilmadi"
          emptyDescription="Hali loglar mavjud emas"
          emptyIcon={<Package className="h-8 w-8 text-muted-foreground" />}
          enableHoverEffect
          onRowClick={(row) => setDetailItem(row)}
        />
      </UniversalPage>

      {/* Detail dialog omitted for simplified structure */}
    </>
  );
}
