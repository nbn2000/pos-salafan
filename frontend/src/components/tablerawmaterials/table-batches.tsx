import { useGetRawMaterialsBatchesQuery } from '@/api/raw-materials/raw-material-batches';
import SkeletonRow from '@/components/skeleton/products';
import BatchesDropdown from '@/components/tablerawmaterials/components/btn/BatchesDropdown';
import { useDebounce } from '@/hooks/useDebounce';
import { MaterialBatchSummary } from '@/interfaces/raw-material/raw-materials';
import { date } from '@/lib/utils';
import {
  Calendar,
  DollarSign,
  FlaskConical,
  Hash,
  MoreHorizontal,
  Tag,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { UniversalPage } from '../common/UniversalPage';
import { UniversalTable } from '../common/UniversalTable';
import AddBatchButtonComponent from './components/btn/addBatch';

export default function TableRawMaterialsBatches() {
  const { id } = useParams<{ id: string | undefined }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [showFilter, setShowFilter] = useState(false);
  const parsedPage = Number(searchParams.get('page'));
  const pageNumber =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const parsedLimit = Number(
    searchParams.get('limit') ?? searchParams.get('take')
  );
  const pageSize =
    Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 6;
  const search = (searchParams.get('search') || '').trim();
  const debounceSearch = useDebounce(search, 500);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC' | undefined>();

  const { data, isLoading } = useGetRawMaterialsBatchesQuery({
    id: id ?? '',
    page: pageNumber,
    limit: pageSize,
    search: debounceSearch,
    sortOrder,
  });

  const filteredAndSortedData = (data?.results || [])
    .filter((item: MaterialBatchSummary) => {
      const createdAt = new Date(item.createdAt);
      const matchStart = !startDate || createdAt >= new Date(startDate);
      const matchEnd =
        !endDate ||
        createdAt <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
      const matchSearch =
        !debounceSearch ||
        item.rawMaterialName
          .toLowerCase()
          .includes(debounceSearch.toLowerCase());
      return matchStart && matchEnd && matchSearch;
    })
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const nameA = (a.rawMaterialName || '').toLowerCase();
      const nameB = (b.rawMaterialName || '').toLowerCase();
      return sortOrder === 'ASC'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  const effectivePageSize = data?.take ?? pageSize;

  const rowNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredAndSortedData.forEach((item: MaterialBatchSummary, index: number) => {
      map.set(item.id, (pageNumber - 1) * effectivePageSize + index + 1);
    });
    return map;
  }, [filteredAndSortedData, pageNumber, effectivePageSize]);

  const DropdownWrapper = ({
    item,
    onRowClick,
  }: {
    item: MaterialBatchSummary;
    onRowClick: (e: React.MouseEvent) => void;
  }) => (
    <div onClick={onRowClick}>
      <BatchesDropdown product={item} />
    </div>
  );

  const columns = [
    {
      key: 'index',
      header: 'No.',
      icon: <Hash className="h-4 w-4 text-primary" />,
      width: '64px',
      render: (item: MaterialBatchSummary) => (
        <span className="text-sm font-semibold text-foreground">
          {`#${rowNumberMap.get(item.id) ?? '?'}`}
        </span>
      ),
    },
    {
      key: 'amount' as keyof MaterialBatchSummary,
      header: 'Miqdori',
      icon: <Tag className="h-4 w-4 text-primary" />,
      render: (item: MaterialBatchSummary) => (
        <div className="text-sm text-black">{item.amount}</div>
      ),
    },

    {
      key: 'exchangeRate' as keyof MaterialBatchSummary,
      header: 'Valyuta kursi',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      render: (item: MaterialBatchSummary) => (
        <span className="text-sm text-black">
          {Number(item.buyPrice ?? 0).toLocaleString('uz-UZ')} so'm
        </span>
      ),
    },
    {
      key: 'buyPrice' as keyof MaterialBatchSummary,
      header: 'Xarid narxi',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      render: (item: MaterialBatchSummary) =>
        item.buyPrice ? (
          <span className="text-sm ">
            {item?.buyPrice.toLocaleString('uz-UZ')} so'm / ${' '}
            {item?.buyPrice.toLocaleString('en-US', {
              maximumFractionDigits: 8,
            })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: 'createdAt' as keyof MaterialBatchSummary,
      header: 'Sana',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      render: (item: MaterialBatchSummary) => (
        <span>{date(item.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      icon: <MoreHorizontal className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <UniversalPage
      header={{
        title:
          filteredAndSortedData[0]?.rawMaterialName ||
          '' + ' ' + 'Xomashyo partiyalari',
        description: 'Barcha xomashyo partiyalarini boshqaring',
        search: {
          value: search || '',
          placeholder: 'Xomashyo nomi orqali qidirish',
        },
        icon: <FlaskConical />,
        actions: <AddBatchButtonComponent />,
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
      }}
      showBreadcrumb
    >
      <UniversalTable<MaterialBatchSummary>
        data={filteredAndSortedData}
        total_pages={data?.totalPages || 1}
        isLoading={isLoading}
        columns={columns}
        dropdownComponent={DropdownWrapper}
        onRowClick={() => {}}
        emptyTitle="Xomashyo partiyalari topilmadi"
        emptyDescription="Hech qanday partiya topilmadi. Filtrlarni tekshiring."
        emptyIcon={<FlaskConical className="h-8 w-8 text-muted-foreground" />}
        skeletonComponent={SkeletonRow}
        enableHoverEffect
      />
    </UniversalPage>
  );
}
