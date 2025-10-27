import { useGetProductLogsQuery } from '@/api/products/product-log';
import SkeletonRecords from '@/components/skeleton/records';
import { useGetDate } from '@/hooks/useGetDate';
import {
  Calendar,
  DatabaseBackup,
  Hash,
  MessageSquare,
  Package,
  Tag,
  Plus,
  Minus,
  ArrowRightLeft,
  FlaskConical,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UniversalPage } from '../common/UniversalPage';
import { UniversalTable } from '../common/UniversalTable';
import { Badge } from '@/components/ui/badge';
import { formatQuantity } from '@/lib/utils';
import { translateMeasurementType } from '@/lib/measurementUtils';

// Log type translations
const logTypeTranslations: Record<ProductLogType, string> = {
  ADD: "Qo'shildi",
  'ADD-BATCH': "Partiya qo'shildi",
  CHANGE: "O'zgartirildi",
  'CHANGE-BATCH': "Partiya o'zgartirildi",
  DELETE: "O'chirildi",
  'DELETE-BATCH': "Partiya o'chirildi",
};

export function InventoryLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { daily, monthly, yearly } = useGetDate();
  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  // Filter states
  const [logType, setLogType] = useState<ProductLogType | ''>('');
  const [searchField, setSearchField] = useState<string>('comment');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [createdFrom, setCreatedFrom] = useState<string>('');
  const [createdTo, setCreatedTo] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);

  const period =
    (searchParams.get('period') as 'all' | 'yearly' | 'monthly' | 'daily') ||
    'all';

  // Build API parameters
  const apiParams: ProductLogQueryParams = {
    page,
    take: 6,
    search: search || undefined,
    searchField,
    sortField,
    sortOrder,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    type: logType || undefined,
  };

  // Convert period filters to createdFrom/createdTo for backend
  if (period !== 'all' && !createdFrom && !createdTo) {
    if (period === 'yearly') {
      apiParams.createdFrom = `${yearly}-01-01`;
      apiParams.createdTo = `${yearly}-12-31`;
    } else if (period === 'monthly') {
      const month = monthly.toString().padStart(2, '0');
      const daysInMonth = new Date(yearly, monthly, 0).getDate();
      apiParams.createdFrom = `${yearly}-${month}-01`;
      apiParams.createdTo = `${yearly}-${month}-${daysInMonth}`;
    } else if (period === 'daily') {
      const month = monthly.toString().padStart(2, '0');
      const day = daily.toString().padStart(2, '0');
      apiParams.createdFrom = `${yearly}-${month}-${day}`;
      apiParams.createdTo = `${yearly}-${month}-${day}`;
    }
  }

  const { data, isFetching } = useGetProductLogsQuery(apiParams);

  function updateParams(patch: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v == null) next.delete(k);
      else next.set(k, v);
    });
    next.set('page', '1');
    setSearchParams(next);
  }

  // Use backend data directly (filtering is handled by backend)
  const logsData = (data?.results || []) as ProductStockLog[];

  const rowNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    logsData.forEach((log, index) => {
      map.set(log.id, (page - 1) * 6 + index + 1);
    });
    return map;
  }, [logsData, page]);

  const getLogTypeIcon = (logType: ProductLogType) => {
    switch (logType) {
      case 'ADD':
      case 'ADD-BATCH':
        return <Plus className="h-3 w-3" />;
      case 'CHANGE':
      case 'CHANGE-BATCH':
        return <ArrowRightLeft className="h-3 w-3" />;
      case 'DELETE':
      case 'DELETE-BATCH':
        return <Minus className="h-3 w-3" />;
      default:
        return <Tag className="h-3 w-3" />;
    }
  };

  const getLogTypeBadge = (logType: ProductLogType) => {
    const isAdd = logType === 'ADD' || logType === 'ADD-BATCH';
    const isChange = logType === 'CHANGE' || logType === 'CHANGE-BATCH';
    const isDelete = logType === 'DELETE' || logType === 'DELETE-BATCH';

    return (
      <Badge
        variant="outline"
        className={`inline-flex items-center gap-1 text-xs ${
          isAdd
            ? 'bg-green-50 text-green-700 border-green-200'
            : isChange
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : isDelete
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-gray-50 text-gray-700 border-gray-200'
        }`}
      >
        {getLogTypeIcon(logType)}
        {logTypeTranslations[logType] || logType}
      </Badge>
    );
  };

  // Define table columns with new Universal Table format
  const columns = [
    {
      key: 'order',
      header: 'No.',
      icon: <Hash className="h-4 w-4 text-primary" />,
      width: '64px',
      render: (log: ProductStockLog) => (
        <span className="font-medium text-foreground">
          {`#${rowNumberMap.get(log.id) ?? '?'}`}
        </span>
      ),
    },
    {
      key: 'logType' as any,
      header: 'Turi',
      icon: <Tag className="h-4 w-4 text-primary" />,
      width: '120px',
      render: (log: ProductStockLog) => getLogTypeBadge(log.type),
    },
    {
      key: 'productName' as const,
      header: 'Mahsulot',
      icon: <Package className="h-4 w-4 text-primary" />,
      render: (log: ProductStockLog) => (
        <div className="flex flex-col">
          <span className="font-medium">{log.productName || 'Noma\'lum'}</span>
        </div>
      ),
    },
    {
      key: 'amount' as const,
      header: 'Miqdor',
      icon: <Package className="h-4 w-4 text-primary" />,
      render: (log: ProductStockLog) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {formatQuantity(log.amount)}
          </span>
        </div>
      ),
    },
    {
      key: 'comment' as const,
      header: 'Izoh',
      icon: <MessageSquare className="h-4 w-4 text-primary" />,
      render: (log: ProductStockLog) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {log.comment || '-'}
        </span>
      ),
    },
    {
      key: 'createdAt' as const,
      header: 'Sana',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      width: '140px',
      render: (log: ProductStockLog) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {new Date(log.createdAt).toLocaleDateString('uz-UZ')}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(log.createdAt).toLocaleTimeString('uz-UZ', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <UniversalPage
      header={{
        title: 'Mahsulot kirdi-chiqdilari',
        description: "Barcha mahsulot harakatlari tarixini ko'ring",
        search: {
          value: search,
          placeholder: 'Loglarni qidirish',
        },
        icon: <DatabaseBackup />,
      }}
      filters={{
        showFilterIcon: true,
        showFilter: showFilter,
        onShowFilterChange: setShowFilter,
        period: {
          value: period,
          onValueChange: (value) =>
            updateParams({ period: value === 'all' ? '' : value }),
        },
        dateRange: {
          startDate: createdFrom,
          endDate: createdTo,
          onStartDateChange: setCreatedFrom,
          onEndDateChange: setCreatedTo,
        },
        searchField: {
          value: searchField,
          onValueChange: setSearchField,
          placeholder: 'Qidirish maydonini tanlang',
          options: [
            { id: 'comment', label: 'Izoh', value: 'comment' },
            { id: 'productName', label: 'Mahsulot nomi', value: 'productName' },
          ],
        },
        sortField: {
          value: sortField,
          onValueChange: setSortField,
          placeholder: 'Saralash maydonini tanlang',
          options: [
            { id: 'createdAt', label: 'Yaratilgan sana', value: 'createdAt' },
            { id: 'productName', label: 'Mahsulot nomi', value: 'productName' },
            { id: 'amount', label: 'Miqdor', value: 'amount' },
            { id: 'comment', label: 'Izoh', value: 'comment' },
            { id: 'type', label: 'Log turi', value: 'type' },
          ],
        },
        sortOrder: {
          value: sortOrder,
          onValueChange: setSortOrder,
          placeholder: 'Saralash tartibini tanlang',
        },
        customFilters: (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block">
              Log turi
            </label>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value as ProductLogType | '')}
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">Barcha turlar</option>
              <option value="ADD">{logTypeTranslations.ADD}</option>
              <option value="ADD-BATCH">{logTypeTranslations['ADD-BATCH']}</option>
              <option value="CHANGE">{logTypeTranslations.CHANGE}</option>
              <option value="CHANGE-BATCH">{logTypeTranslations['CHANGE-BATCH']}</option>
              <option value="DELETE">{logTypeTranslations.DELETE}</option>
              <option value="DELETE-BATCH">{logTypeTranslations['DELETE-BATCH']}</option>
            </select>
          </div>
        ),
      }}
      showBreadcrumb={true}
    >
      <UniversalTable<ProductStockLog>
        data={logsData}
        total_pages={data?.totalPages}
        isLoading={isFetching}
        columns={columns}
        emptyTitle="Ma'lumot topilmadi"
        emptyDescription="Qidiruv natijalariga mos keladigan kirdi-chiqdi ma'lumoti mavjud emas. Filtrlarni o'zgartiring yoki boshqa vaqt oralig'ini tanlang."
        emptyIcon={<Package className="h-8 w-8 text-muted-foreground" />}
        skeletonComponent={SkeletonRecords}
        enableHoverEffect={true}
      />
    </UniversalPage>
  );
}
