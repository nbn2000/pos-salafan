// pages/raw-material-logs/index.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useMemo, useState } from 'react';
import { FlaskConical, Hash, Tag, Calendar, Box, Filter, Activity, Plus, Minus, ArrowRightLeft } from 'lucide-react';
import { UniversalTable } from '@/components/common/UniversalTable';
import { UniversalPage } from '@/components/common/UniversalPage';
import { Badge } from '@/components/ui/badge';
import SkeletonRow from '@/components/skeleton/products';
import { date, formatQuantity } from '@/lib/utils';
import { useGetRawMaterialLogsQuery } from '@/api/raw-materials/raw-material-log';
import RootLayout from '@/layout';

type UUID = string;

// Agar global tiplar sizda allaqachon bo‘lsa, quyidagini o‘chirib yuborishingiz mumkin
type RawMaterialStockLog = {
  id: UUID;
  createdAt: string;
  updatedAt: string;
  rawMaterialId: UUID;
  rawMaterialName: string;
  rawMaterialBatchId: UUID;
  amount: number;
  comment: string;
};

// Log type translations
const logTypeTranslations: Record<RawMaterialLogType, string> = {
  'ADD': 'Qo\'shildi',
  'ADD_BATCH': 'Partiya qo\'shildi',
  'CHANGE': 'O\'zgartirildi',
  'CHANGE_BATCH': 'Partiya o\'zgartirildi',
  'DELETE': 'O\'chirildi',
  'DELETE_BATCH': 'Partiya o\'chirildi',
  'DELETE-BATCH': 'Partiya o\'chirildi',
  'CHANGE-BATCH': 'Partiya o\'zgartirildi',
};

// Log type icons and styling
const getLogTypeIcon = (logType: RawMaterialLogType) => {
  switch (logType) {
    case 'ADD':
    case 'ADD_BATCH':
      return <Plus className="h-3 w-3" />;
    case 'CHANGE':
    case 'CHANGE_BATCH':
    case 'CHANGE-BATCH':
      return <ArrowRightLeft className="h-3 w-3" />;
    case 'DELETE':
    case 'DELETE_BATCH':
    case 'DELETE-BATCH':
      return <Minus className="h-3 w-3" />;
    default:
      return <Tag className="h-3 w-3" />;
  }
};

const getLogTypeBadge = (logType: RawMaterialLogType) => {
  const isAdd = logType === 'ADD' || logType === 'ADD_BATCH';
  const isChange = logType === 'CHANGE' || logType === 'CHANGE_BATCH' || logType === 'CHANGE-BATCH';
  const isDelete = logType === 'DELETE' || logType === 'DELETE_BATCH' || logType === 'DELETE-BATCH';

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

export default function RawMaterialLogsTable() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const parsedPage = Number(searchParams.get('page'));
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const parsedTake = Number(searchParams.get('take'));
  const take =
    Number.isFinite(parsedTake) && parsedTake > 0 ? parsedTake : 6;
  const search = (searchParams.get('search') || '').trim();

  // Backend filters
  const [createdFrom, setCreatedFrom] = useState<string>('');
  const [createdTo, setCreatedTo] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('comment');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showFilter, setShowFilter] = useState(false);
  const [logType, setLogType] = useState<RawMaterialLogType | ''>('');

  const debouncedSearch = useDebounce(search, 400);

  // Serverdan olish (RTK Query) with backend filters
  const { data, isLoading } = useGetRawMaterialLogsQuery({
    page,
    take,
    search: debouncedSearch || undefined,
    searchField,
    sortField,
    sortOrder,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    type: logType || undefined,
  });

  // Use backend-filtered data directly
  const filtered = data?.results ?? [];

  const rowNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item: RawMaterialLogResult, index: number) => {
      map.set(item.id, (page - 1) * take + index + 1);
    });
    return map;
  }, [filtered, page, take]);

  // URL param yangilash helper’i (page/search/take va h.k.)
  const updateParam = (k: string, v?: string) => {
    const p = new URLSearchParams(location.search);
    if (k !== 'page') p.delete('page'); // sahifani reset
    if (v && v.trim() !== '') p.set(k, v);
    else p.delete(k);
    navigate({ search: p.toString() }, { replace: true });
  };

  const columns = [
    {
      key: 'order',
      header: 'No.',
      icon: <Hash className="h-4 w-4 text-primary" />,
      width: '64px',
      render: (row: RawMaterialLogResult) => (
        <span className="font-medium text-foreground">
          {`#${rowNumberMap.get(row.id) ?? '?'}`}
        </span>
      ),
    },
    {
      key: 'rawMaterial.name' as any,
      header: 'Xomashyo',
      icon: <FlaskConical className="h-4 w-4 text-primary" />,
      render: (row: RawMaterialLogResult) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.rawMaterialName || 'Noma\'lum'}</span>
        </div>
      ),
    },
    {
      key: 'logType' as any,
      header: 'Turi',
      icon: <Tag className="h-4 w-4 text-primary" />,
      width: '120px',
      render: (row: RawMaterialLogResult) => getLogTypeBadge(row.type),
    },
    {
      key: 'rawMaterialBatchId' as keyof RawMaterialLogResult,
      header: 'Partiya ID',
      icon: <Tag className="h-4 w-4 text-primary" />,
      width: '100px',
      render: (row: RawMaterialLogResult) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.rawMaterialBatchId ? `...${row.rawMaterialBatchId.slice(-8)}` : '-'}
        </span>
      ),
    },
    {
      key: 'amount' as any,
      header: 'Miqdor',
      icon: <Box className="h-4 w-4 text-primary" />,
      render: (row: RawMaterialLogResult) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {formatQuantity(row.amount)}
          </span>
        </div>
      ),
    },
    {
      key: 'comment' as any,
      header: 'Izoh',
      icon: <Tag className="h-4 w-4 text-primary" />,
      render: (row: RawMaterialLogResult) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {row.comment || '-'}
        </span>
      ),
    },
    {
      key: 'createdAt' as any,
      header: 'Sana',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      width: '140px',
      render: (row: RawMaterialLogResult) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {new Date(row.createdAt).toLocaleDateString('uz-UZ')}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(row.createdAt).toLocaleTimeString('uz-UZ', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <RootLayout>
      <UniversalPage
        header={{
          title: 'Homashyo loglari',
          description: 'Homashyo partiyalari harakati (kirim/chiqim) tarixi',
          search: {
            value: search,
            placeholder: 'Homashyo nomi yoki izoh bo‘yicha qidirish',
          },
          icon: <FlaskConical />,
        }}
        filters={{
          showFilterIcon: true,
          showFilter,
          onShowFilterChange: setShowFilter,
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
              { id: 'rawMaterialName', label: 'Homashyo nomi', value: 'rawMaterialName' },
            ],
          },
          customFilters: (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">
                Log turi
              </label>
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value as RawMaterialLogType | '')}
                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Barcha turlar</option>
                <option value="ADD">{logTypeTranslations.ADD}</option>
                <option value="ADD_BATCH">{logTypeTranslations.ADD_BATCH}</option>
                <option value="CHANGE">{logTypeTranslations.CHANGE}</option>
                <option value="CHANGE_BATCH">{logTypeTranslations.CHANGE_BATCH}</option>
                <option value="CHANGE-BATCH">{logTypeTranslations['CHANGE-BATCH']}</option>
                <option value="DELETE">{logTypeTranslations.DELETE}</option>
                <option value="DELETE_BATCH">{logTypeTranslations.DELETE_BATCH}</option>
                <option value="DELETE-BATCH">{logTypeTranslations['DELETE-BATCH']}</option>
              </select>
            </div>
          ),
          sortField: {
            value: sortField,
            onValueChange: setSortField,
            placeholder: 'Saralash maydonini tanlang',
            options: [
              { id: 'createdAt', label: 'Yaratilgan sana', value: 'createdAt' },
              { id: 'rawMaterialName', label: 'Homashyo nomi', value: 'rawMaterialName' },
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
        }}
        showBreadcrumb
      >
        <UniversalTable<RawMaterialLogResult>
          data={filtered}
          isLoading={isLoading}
          total_pages={data?.totalPages ?? 1}
          columns={columns}
          // qatorni bosganda homashyo detaliga o‘tish (ixtiyoriy)
          navigateToDetail={(row) => `/raw-materials/${row.rawMaterialId}`}
          onRowClick={(row) => navigate(`/raw-materials/${row.rawMaterialId}`)}
          emptyTitle="Loglar topilmadi"
          emptyDescription="Filtrlarni o‘zgartirib qayta urinib ko‘ring."
          emptyIcon={<FlaskConical className="h-8 w-8 text-muted-foreground" />}
          skeletonComponent={SkeletonRow}
          enableHoverEffect
        />
      </UniversalPage>
    </RootLayout>
  );
}

