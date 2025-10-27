import { useGetRawMaterialsQuery } from '@/api/raw-materials';
import SkeletonRow from '@/components/skeleton/products';
import { useDebounce } from '@/hooks/useDebounce';
import { RawMaterialDetailDialog } from './components/RawMaterialDetailDialog';
import type { RawMaterial, Priority } from '@/interfaces/raw-material/raw-materials';
import { date } from '@/lib/utils';
import { translateMeasurementType } from '@/lib/measurementUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Box,
  Calendar,
  DollarSign,
  FlaskConical,
  Hash,
  Tag,
  TrendingUp,
  TrendingDown,
  Package2,
  Scale,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UniversalPage } from '../common/UniversalPage';
import { UniversalTable } from '../common/UniversalTable';
import AddButtonComponent from './components/btn/addProduct';
import Dropdown from './components/btn/Dropdown';

const PAGE_SIZE = 6;

export default function TableRawMaterials() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const pageNumber = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';
  const debouncedSearch = useDebounce(search, 500);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'az' | 'za' | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [showFilter, setShowFilter] = useState(false);
  const [detailItem, setDetailItem] = useState<RawMaterial | null>(null);

  const { data, isLoading } = useGetRawMaterialsQuery({
    page: pageNumber,
    take: PAGE_SIZE,
    search: debouncedSearch || undefined,
    searchField: "name",
    sortField: sortOrder ? 'name' : 'createdAt',
    sortOrder: sortOrder === 'az' ? 'ASC' : 'DESC',
    priority: priorityFilter || undefined,
  });

  const filteredData = useMemo(() => {
    const baseList = data?.results ?? [];

    const filtered = baseList.filter((item: RawMaterial) => {
      const createdAtValue = new Date(item.material.createdAt);
      const createdAt = Number.isNaN(createdAtValue.getTime())
        ? undefined
        : createdAtValue;
      const matchStart =
        !startDate || (createdAt && createdAt >= new Date(startDate));
      const matchEnd =
        !endDate ||
        (createdAt &&
          createdAt <= new Date(new Date(endDate).setHours(23, 59, 59, 999)));
      const matchSearch =
        !debouncedSearch ||
        item.material.name
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());
      return matchStart && matchEnd && matchSearch;
    });

    if (!sortOrder) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const nameA = a.material.name?.toLowerCase() || '';
      const nameB = b.material.name?.toLowerCase() || '';
      return sortOrder === 'az'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }, [data, startDate, endDate, debouncedSearch, sortOrder]);

  const rowNumberMap = useMemo(
    () =>
      new Map(
        filteredData.map((item, index) => [
          item,
          (pageNumber - 1) * PAGE_SIZE + index + 1,
        ])
      ),
    [filteredData, pageNumber]
  );


  const translatePriority = (priority?: Priority) => {
    switch (priority) {
      case 'HIGH':
        return 'Baland';
      case 'LOW':
        return 'Past';
      default:
        return 'Past'; // default
    }
  };

  const columns = [
    {
      key: 'order',
      header: 'No.',
      icon: <Hash className="h-4 w-4 text-primary" />,
      width: '72px',
      render: (item: RawMaterial) => (
        <span className="font-medium text-foreground">
          {rowNumberMap.get(item) ?? '�'}
        </span>
      ),
    },
    {
      key: 'material.name' as const,
      header: 'Nomi',
      icon: <Tag className="h-4 w-4 text-primary" />,
      render: (item: RawMaterial) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {item.material.name}
          </span>
          <span className="text-xs text-muted-foreground">
            Kod: {item.material.id.slice(0, 8)}
          </span>
        </div>
      ),
    },
    {
      key: 'material.type' as const,
      header: 'Birligi',
      icon: <Tag className="h-4 w-4 text-primary" />,
      render: (item: RawMaterial) => (
        <span className="text-muted-foreground">
          {translateMeasurementType(item.material.type)}
        </span>
      ),
    },
    {
      key: 'totalBatchAmount' as const,
      header: 'Miqdori',
      icon: <Box className="h-4 w-4 text-primary" />,
      render: (item: RawMaterial) => (
        <span className="font-medium">
          {Number(item.totalBatchAmount ?? 0).toLocaleString('uz-UZ')}
        </span>
      ),
    },
    {
      key: 'material.priority' as const,
      header: 'Muhimlik',
      icon: <Tag className="h-4 w-4 text-primary" />,
      render: (item: RawMaterial) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          item.material.priority === 'HIGH' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {translatePriority(item.material.priority)}
        </span>
      ),
    },
    {
      key: 'batches' as const,
      header: 'Dona Narxi',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      render: (item: RawMaterial) => {
        const latest = item.batches?.[item.batches.length - 1];
        if (!latest) {
          return (
            <span className="text-sm text-muted-foreground">Ma'lumot yo'q</span>
          );
        }
        const dollarAmount = latest.buyPrice;

        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {latest.buyPrice.toLocaleString('uz-UZ')} so'm
            </span>
            <span className="text-xs text-muted-foreground">
              ${' '}
              {dollarAmount.toLocaleString('en-US', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
            </span>
          </div>
        );
      },
    },
    {
      key: 'material.updatedAt' as const,
      header: 'Yangilangan',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      render: (item: RawMaterial) => (
        <span className="text-sm text-muted-foreground">
          {date(item.material.updatedAt)}
        </span>
      ),
    },
    {
      key: 'actions' as const,
      header: 'Amallar',
      render: (item: RawMaterial) => (
        <Dropdown
          item={item}
          onShowDetail={() => setDetailItem(item)}
          onNavigate={() => navigate(`/raw-materials/${item.material.id}`)}
        />
      ),
    },
  ];

  return (
    <>
      <UniversalPage
        header={{
          title: 'Homashyo',
          description: 'Barcha homashyolarni boshqaring',
          search: {
            value: search || '',
            placeholder: 'Homashyo nomi orqali qidirish',
          },
          icon: <FlaskConical />,
          actions: <AddButtonComponent />,
        }}
        filters={{
          showFilterIcon: true,
          showFilter,
          onShowFilterChange: setShowFilter,
          dateRange: {
            startDate,
            endDate,
            onStartDateChange: setStartDate,
            onEndDateChange: setEndDate,
          },
          sort: {
            sortOrder,
            onSortOrderChange: setSortOrder,
          },
          customFilters: (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">
                Muhimlik darajasi
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
                className="h-9 w-full rounded-md border border-border/50 bg-background/80 backdrop-blur-sm px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Barchasi</option>
                <option value="HIGH">Baland</option>
                <option value="LOW">Past</option>
              </select>
            </div>
          ),
        }}
        showBreadcrumb
      >
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Baland muhimlik (KG)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Number(data?.totalHighKg ?? 0).toLocaleString('uz-UZ')} kg
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Past muhimlik (KG)
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Number(data?.totalLowKg ?? 0).toLocaleString('uz-UZ')} kg
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Baland muhimlik (Dona)
              </CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Number(data?.totalHighUnit ?? 0).toLocaleString('uz-UZ')} dona
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Past muhimlik (Dona)
              </CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Number(data?.totalLowUnit ?? 0).toLocaleString('uz-UZ')} dona
              </div>
            </CardContent>
          </Card>
        </div>

        <UniversalTable<RawMaterial>
          data={filteredData}
          total_pages={data?.totalPages || 1}
          isLoading={isLoading}
          columns={columns}
          emptyTitle="Homashyo topilmadi"
          emptyDescription="Hech qanday homashyo topilmadi. Filtrlarni tekshiring."
          emptyIcon={<FlaskConical className="h-8 w-8 text-muted-foreground" />}
          skeletonComponent={SkeletonRow}
          enableHoverEffect
          onRowClick={(item) => setDetailItem(item)}
        />
      </UniversalPage>

      <RawMaterialDetailDialog
        open={detailItem !== null}
        onClose={() => setDetailItem(null)}
        item={detailItem}
      />
    </>
  );
}
