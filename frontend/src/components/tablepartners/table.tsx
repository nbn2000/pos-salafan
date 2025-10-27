import { useGetPartnersQuery } from '@/api/partners';
import SkeletonRow from '@/components/skeleton/products';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Calendar,
  HandHelping,
  Hash,
  MoreHorizontal,
  Phone,
  User,
} from 'lucide-react';
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

  const { data, isFetching } = useGetPartnersQuery({
    page: pageNumber,
    search: debounceSearch!,
  });

  // Filter and sort data by date range and alphabetical order
  const filteredAndSortedData = (data?.results || [])
    .filter((partner: Partner) => {
      const createdAt = new Date(partner.createdAt);
      const matchStart = !startDate || createdAt >= new Date(startDate);
      const matchEnd =
        !endDate ||
        createdAt <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
      return matchStart && matchEnd;
    })
    .sort((a: Partner, b: Partner) => {
      if (!sortOrder) return 0;
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';

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
    item: Partner;
    onRowClick: (e: React.MouseEvent) => void;
  }) => (
    <div onClick={onRowClick}>
      <Dropdown product={item} />
    </div>
  );

  // Handle row click to navigate to debtor detail page
  const handleRowClick = (item: Partner) => {
    navigate(`/partners/${item.id}`);
  };

  // Define table columns with new Universal Table format
  const columns = [
    {
      key: 'index' as keyof Partner,
      header: 'ID',
      icon: <Hash className="h-4 w-4 text-primary" />,
    },
    {
      key: 'name' as keyof Partner,
      header: "To'liq ism",
      icon: <User className="h-4 w-4 text-primary" />,
    },
    {
      key: 'phone' as keyof Partner,
      header: 'Telefon raqam',
      icon: <Phone className="h-4 w-4 text-primary" />,
      hidden: true,
    },
    {
      key: 'createdAt' as keyof Partner,
      header: 'Sana',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      hidden: true,
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
        description: 'Barcha hamkorlarni boshqaring va kuzatib boring',
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
      <UniversalTable<Partner>
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
