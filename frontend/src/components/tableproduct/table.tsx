// components/products/TableProducts.tsx
import SkeletonRow from '@/components/skeleton/products';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import {
  ArrowLeft,
  Box,
  Calendar,
  DollarSign,
  Hash,
  Package,
  Tag,
  TrendingUp,
  TrendingDown,
  Package2,
  Scale,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UniversalPage } from '../common/UniversalPage';
import { UniversalTable } from '../common/UniversalTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatQuantity } from '@/lib/utils';
import AddButtonComponent from './components/btn/addProduct';
import Dropdown from './components/btn/Dropdown';
import { ProductDetailDialog } from './components/ProductDetailDialog';

import { useGetProductsQuery } from '@/api/products';
import { useDeleteProductMutation } from '@/api/products';
import { translateMeasurementType } from '@/lib/measurementUtils';

const PAGE_SIZE = 6;

export default function TableProducts() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const pageNumber = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';

  const debouncedSearch = useDebounce(search, 500);

  // Filter states
  const [priority, setPriority] = useState<'HIGH' | 'LOW' | ''>('');
  const [searchField, setSearchField] = useState<string>('name');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [createdFrom, setCreatedFrom] = useState<string>('');
  const [createdTo, setCreatedTo] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);
  const [detailItem, setDetailItem] = useState<ProductWithBatches | null>(null);

  const { data, isFetching, isError, error } = useGetProductsQuery({
    page: pageNumber,
    take: PAGE_SIZE,
    search: debouncedSearch || undefined,
    searchField,
    sortField,
    sortOrder,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    priority: priority || undefined,
  });

  useEffect(() => {
    if (isError) {
      toast.error('Mahsulotlarni yuklashda xatolik yuz berdi');
      console.error(error);
    }
  }, [isError, error]);

  // Use backend-filtered data directly (filtering is handled by backend)
  const filteredData = useMemo(() => {
    return data?.results ?? [];
  }, [data]);

  const rowNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((product, index) => {
      map.set(product.id, (pageNumber - 1) * PAGE_SIZE + index + 1);
    });
    return map;
  }, [filteredData, pageNumber]);

  // Priority translation helper
  const translatePriority = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return 'Baland';
      case 'LOW':
        return 'Past';
      default:
        return 'Past'; // Default to LOW
    }
  };

  // Priority badge helper
  const getPriorityBadge = (priority?: string) => {
    const isHigh = priority === 'HIGH';
    return (
      <Badge
        variant="outline"
        className={`inline-flex items-center gap-1 text-xs ${
          isHigh
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-green-50 text-green-700 border-green-200'
        }`}
      >
        {isHigh ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {translatePriority(priority)}
      </Badge>
    );
  };

  const showDetail = (item: ProductWithBatches) => setDetailItem(item);
  const handleCloseDetail = () => setDetailItem(null);

  const DropdownWrapper = ({
    item,
  }: {
    item: ProductWithBatches;
    onRowClick: (e: React.MouseEvent) => void;
  }) => (
    <Dropdown
      item={item}
      onShowDetail={() => showDetail(item)}
      onNavigate={() => navigate(`/products/${item.id}`)}
    />
  );

  const BackNavigation = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className="h-8 w-8 p-0 hover:bg-primary/10 mr-2"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );

  const renderPreview = (item: ProductWithBatches) => {
    // Since images are no longer in backend, show name initial
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground">
        {item.name.charAt(0)?.toUpperCase() ?? '?'}
      </div>
    );
  };

  const firstBatch = (item: ProductWithBatches) => item.batches?.[0];

  const columns = [
    {
      key: 'order',
      header: 'No.',
      icon: <Hash className="h-4 w-4 text-primary" />,
      width: '72px',
      render: (item: ProductWithBatches) => (
        <span className="font-medium text-foreground">
          {`#${rowNumberMap.get(item.id) ?? '?'}`}
        </span>
      ),
    },
    {
      key: 'priority' as any,
      header: 'Muhimlik',
      icon: <Tag className="h-4 w-4 text-primary" />,
      width: '120px',
      render: (item: ProductWithBatches) => getPriorityBadge(item.priority),
    },
    {
      key: 'name' as keyof ProductWithBatches,
      header: 'Nomi',
      icon: <Package className="h-4 w-4 text-primary" />,
      render: (item: ProductWithBatches) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground">
            Partiyalar: {item.batches?.length ?? 0}
          </span>
        </div>
      ),
    },
    {
      key: 'type' as keyof ProductWithBatches,
      header: 'Turi',
      icon: <Tag className="h-4 w-4 text-primary" />,
      render: (item: ProductWithBatches) => (
        <span className="text-sm">
          {translateMeasurementType(item.type)}
        </span>
      ),
    },
    {
      key: 'totalBatchAmount' as keyof ProductWithBatches,
      header: 'Umumiy miqdor',
      icon: <Box className="h-4 w-4 text-primary" />,
      render: (item: ProductWithBatches) => (
        <span className="font-semibold">
          {item.totalBatchAmount?.toLocaleString('uz-UZ') ?? '—'}
        </span>
      ),
    },
    {
      key: 'sellPrice' as any,
      header: 'Sotuv narxi',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      render: (item: ProductWithBatches) => {
        const firstBatchPrice = item.batches?.[0]?.sellPrice;
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {firstBatchPrice ? `${formatQuantity(firstBatchPrice)} so'm` : '—'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt' as keyof ProductWithBatches,
      header: 'Sana',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      width: '140px',
      render: (item: ProductWithBatches) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleTimeString('uz-UZ', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'actions' as const,
      header: 'Amallar',
      icon: <Package className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <>
      <UniversalPage
        header={{
          title: 'Mahsulotlar',
          description: 'Barcha mahsulotlarni boshqaring va kuzatib boring',
          search: {
            value: search || '',
            placeholder: 'Mahsulotlarni qidirish',
          },
          icon: <Package />,
          actions: (
            <AddButtonComponent />
          ),
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
              { id: 'name', label: 'Mahsulot nomi', value: 'name' },
            ],
          },
          sortField: {
            value: sortField,
            onValueChange: setSortField,
            placeholder: 'Saralash maydonini tanlang',
            options: [
              { id: 'createdAt', label: 'Yaratilgan sana', value: 'createdAt' },
              { id: 'name', label: 'Mahsulot nomi', value: 'name' },
              { id: 'totalBatchAmount', label: 'Umumiy miqdor', value: 'totalBatchAmount' },
              { id: 'priority', label: 'Muhimlik', value: 'priority' },
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
                Muhimlik darajasi
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'HIGH' | 'LOW' | '')}
                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
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

        <UniversalTable<ProductWithBatches>
          data={filteredData}
          total_pages={data?.totalPages || 1}
          currentPage={pageNumber}
          pageSize={PAGE_SIZE}
          isLoading={isFetching}
          columns={columns}
          dropdownComponent={DropdownWrapper}
          emptyTitle="Mahsulot topilmadi"
          emptyDescription="Qidiruv natijalariga mos keladigan mahsulot mavjud emas. Filtrlarni o'zgartiring yoki boshqa kalit so'zlar bilan qayta urinib ko'ring."
          emptyIcon={<Package className="h-8 w-8 text-muted-foreground" />}
          skeletonComponent={SkeletonRow}
          enableHoverEffect
          onRowClick={showDetail}
        />
      </UniversalPage>

      <ProductDetailDialog
        open={detailItem !== null}
        onClose={handleCloseDetail}
        item={detailItem}
      />
    </>
  );
}
