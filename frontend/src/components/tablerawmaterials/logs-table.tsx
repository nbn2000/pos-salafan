import React, { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetRawMaterialLogsQuery } from '@/api/raw-materials/raw-material-log';
import { UniversalPage } from '@/components/common/UniversalPage';
import { UniversalTable } from '@/components/common/UniversalTable';
import SkeletonRow from '@/components/skeleton/products';
import { FlaskConical, Hash, Tag, Calendar, Box, Plus, Minus, ArrowRightLeft, DollarSign, Package, Activity } from 'lucide-react';
import { formatQuantity } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { translateMeasurementType } from '@/lib/measurementUtils';

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

// Log type colors
const logTypeColors: Record<RawMaterialLogType, string> = {
  'ADD': 'bg-green-100 text-green-800 hover:bg-green-200',
  'ADD_BATCH': 'bg-green-100 text-green-800 hover:bg-green-200',
  'CHANGE': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'CHANGE_BATCH': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'CHANGE-BATCH': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'DELETE': 'bg-red-100 text-red-800 hover:bg-red-200',
  'DELETE_BATCH': 'bg-red-100 text-red-800 hover:bg-red-200',
  'DELETE-BATCH': 'bg-red-100 text-red-800 hover:bg-red-200',
};

const PAGE_SIZE = 6;

export default function RawMaterialLogsTableEmbed() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const parsedPage = Number(searchParams.get('page'));
  const pageNumber =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const search = searchParams.get('search') || '';
  
  // Filter states
  const [logType, setLogType] = useState<RawMaterialLogType | ''>('');
  const [searchField, setSearchField] = useState<string>('comment');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [createdFrom, setCreatedFrom] = useState<string>('');
  const [createdTo, setCreatedTo] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);
  
  const debouncedSearch = useDebounce(search, 400);
  
  const { data, isLoading } = useGetRawMaterialLogsQuery({
    page: pageNumber,
    take: PAGE_SIZE,
    search: debouncedSearch || undefined,
    searchField,
    sortField,
    sortOrder,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    type: logType || undefined,
  });

  const rows: RawMaterialLogResult[] = useMemo(() => {
    return (data?.results ?? []) as RawMaterialLogResult[];
  }, [data?.results]);

  const pageSize = data?.take && data.take > 0 ? data.take : PAGE_SIZE;

  const rowNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, index) => {
      map.set(row.id, (pageNumber - 1) * pageSize + index + 1);
    });
    return map;
  }, [rows, pageNumber, pageSize]);

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
        return <Activity className="h-3 w-3" />;
    }
  };

  const getLogTypeBadge = (logType: RawMaterialLogType) => {
    return (
      <Badge variant="secondary" className={logTypeColors[logType]}>
        {getLogTypeIcon(logType)}
        <span className="ml-1">{logTypeTranslations[logType]}</span>
      </Badge>
    );
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
      key: 'logType' as any,
      header: 'Turi',
      icon: <Tag className="h-4 w-4 text-primary" />,
      width: '120px',
      render: (row: RawMaterialLogResult) => getLogTypeBadge(row.type),
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
      key: 'amount' as any,
      header: 'Miqdor',
      icon: <Package className="h-4 w-4 text-primary" />,
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
    <UniversalPage
      header={{
        title: 'Homashyo loglari',
        description: 'Homashyo partiyalari harakati (kirim/chiqim) tarixi',
        search: {
          value: search,
          placeholder: "Homashyo nomi yoki izoh bo'yicha qidirish",
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
              <option value="DELETE">{logTypeTranslations.DELETE}</option>
              <option value="DELETE_BATCH">{logTypeTranslations.DELETE_BATCH}</option>
            </select>
          </div>
        ),
      }}
      showBreadcrumb={false}
    >
      <UniversalTable<RawMaterialLogResult>
        data={rows}
        isLoading={isLoading}
        total_pages={data?.totalPages ?? 1}
        columns={columns}
        emptyTitle="Loglar topilmadi"
        emptyDescription="Filtrlarni o'zgartirib qayta urinib ko'ring."
        emptyIcon={<FlaskConical className="h-8 w-8 text-muted-foreground" />}
        skeletonComponent={SkeletonRow}
        enableHoverEffect
      />
    </UniversalPage>
  );
}

