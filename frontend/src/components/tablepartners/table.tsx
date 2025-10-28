import { useGetPartnersWithFinanceQuery } from '@/api/partners';
import SkeletonRow from '@/components/skeleton/products';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Calendar,
  DollarSign,
  HandHelping,
  Hash,
  MoreHorizontal,
  Phone,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UniversalPage } from '../common/UniversalPage';
import { UniversalTable } from '../common/UniversalTable';
import AddButtonComponent from './components/btn/addPartner';
import Dropdown from './components/btn/Dropdown';

export default function TablePartner() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const pageNumber = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search');
  const debounceSearch = useDebounce(search, 500);

  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'az' | 'za' | ''>('');
  const [showFilter, setShowFilter] = useState(false);

  const { data, isFetching } = useGetPartnersWithFinanceQuery({
    page: pageNumber,
    search: debounceSearch!,
  });

  // Filter and sort data by date range and alphabetical order
  const filteredAndSortedData = (data?.results || [])
    .filter((supplierRow: SupplierFinanceRow) => {
      // Since supplier finance doesn't have createdAt, we'll skip date filtering for now
      // or we could filter by the first item's createdAt if needed
      if (!startDate && !endDate) return true;

      // Get the first item's createdAt if available
      const firstItemDate = supplierRow.items?.[0]?.material?.createdAt;
      if (!firstItemDate) return true;

      const createdAt = new Date(firstItemDate);
      const matchStart = !startDate || createdAt >= new Date(startDate);
      const matchEnd =
        !endDate ||
        createdAt <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
      return matchStart && matchEnd;
    })
    .sort((a: SupplierFinanceRow, b: SupplierFinanceRow) => {
      if (!sortOrder) return 0;
      const nameA = a.supplier.name?.toLowerCase() || '';
      const nameB = b.supplier.name?.toLowerCase() || '';

      if (sortOrder === 'az') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

  // Wrapper component for Dropdown
  const DropdownWrapper = ({
    item,
    onRowClick,
  }: {
    item: SupplierFinanceRow;
    onRowClick: (e: React.MouseEvent) => void;
  }) => (
    <div onClick={onRowClick}>
      <Dropdown product={item.supplier} />
    </div>
  );

  // Handle row click to navigate to supplier detail page
  const handleRowClick = (item: SupplierFinanceRow) => {
    navigate(`/partners/${item.supplier.id}`);
  };

  // Define table columns with new Universal Table format
  const columns = [
    {
      key: 'index',
      header: 'ID',
      icon: <Hash className="h-4 w-4 text-primary text-left" />,
    },
    {
      key: 'name',
      header: "To'liq ism",
      icon: <User className="h-4 w-4 text-primary text-left" />,
      render: (supplierRow: SupplierFinanceRow) => (
        <span className="font-medium text-left">
          {supplierRow.supplier.name}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefon raqam',
      icon: <Phone className="h-4 w-4 text-primary text-left" />,
      width: '140px',
      render: (supplierRow: SupplierFinanceRow) => (
        <div className="flex justify-left">
          {supplierRow.supplier.phone ? (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {supplierRow.supplier.phone}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              Telefon yo'q
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'debt',
      header: 'Qarz',
      icon: <DollarSign className="h-4 w-4 text-primary text-left" />,
      width: '150px',
      headerAlign: 'center' as const,
      render: (supplierRow: SupplierFinanceRow) => {
        const debt = supplierRow.credit || 0;
        return (
          <div className="flex justify-left">
            {debt > 0 ? (
              <Badge
                variant="destructive"
                className="bg-red-100 text-red-800 border-red-200 font-semibold"
              >
                {debt.toLocaleString('uz-UZ')} so'm
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 border-green-200"
              >
                Qarz yo'q
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'materials',
      header: 'Xomashyolar',
      icon: <Calendar className="h-4 w-4 text-primary text-left" />,
      width: '120px',
      headerAlign: 'left' as const,
      render: (supplierRow: SupplierFinanceRow) => (
        <div className="flex justify-left">
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            {supplierRow.items?.length || 0} ta
          </Badge>
        </div>
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
        title: 'Hamkorlar',
        description: "Hamkorlar ro'yxati va ularning qarzlari",
        search: {
          value: search || '',
          placeholder: 'Hamkorni qidirish',
        },
        icon: <HandHelping />,
        actions: <AddButtonComponent />,
      }}
      filters={{
        showFilterIcon: true,
        showFilter: showFilter,
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
      }}
      showBreadcrumb={true}
    >
      <UniversalTable<SupplierFinanceRow>
        data={filteredAndSortedData}
        total_pages={data?.totalPages}
        isLoading={isFetching}
        columns={columns}
        dropdownComponent={DropdownWrapper}
        onRowClick={handleRowClick}
        emptyTitle="Hamkor topilmadi"
        emptyDescription="Qidiruv natijalariga mos keladigan hamkor mavjud emas. Filtrlarni o'zgartiring yoki boshqa kalit so'zlar bilan qayta urinib ko'ring."
        emptyIcon={<HandHelping className="h-8 w-8 text-muted-foreground" />}
        skeletonComponent={SkeletonRow}
        enableHoverEffect={true}
        isUsd={true}
        currentPage={pageNumber}
        pageSize={6}
      />
    </UniversalPage>
  );
}
