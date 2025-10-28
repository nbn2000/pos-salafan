import { useGetClientsQuery, useGetDebtorsQuery } from '@/api/clients';
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
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UniversalPage } from '../common/UniversalPage';
import { UniversalTable } from '../common/UniversalTable';
import AddButtonComponent from './components/btn/addProduct';
import Dropdown from './components/btn/Dropdown';

export default function TableCustomer() {
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

  const { data, isFetching } = useGetClientsQuery({
    page: pageNumber,
    search: debounceSearch!,
  });

  // Get debt information for all clients
  const { data: debtData } = useGetDebtorsQuery({
    page: 1,
    take: 1000, // Get all debtors to match with clients
  });

  // Create a map of client debts for quick lookup
  const debtMap = useMemo(() => {
    const map = new Map<string, number>();
    (debtData?.results || []).forEach((debtor: any) => {
      map.set(debtor.client.id, Number(debtor.credit || 0));
    });
    return map;
  }, [debtData]);

  // Filter and sort data by date range and alphabetical order
  const filteredAndSortedData = (data?.results || [])
    .filter((client: Client) => {
      const createdAt = new Date(client.createdAt);
      const matchStart = !startDate || createdAt >= new Date(startDate);
      const matchEnd =
        !endDate ||
        createdAt <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
      return matchStart && matchEnd;
    })
    .sort((a: Client, b: Client) => {
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
    item: Client;
    onRowClick: (e: React.MouseEvent) => void;
  }) => (
    <div onClick={onRowClick}>
      <Dropdown product={item} />
    </div>
  );

  // Handle row click to navigate to debtor detail page
  const handleRowClick = (item: Client) => {
    navigate(`/customers/${item.id}`);
  };

  // Define table columns with new Universal Table format
  const columns = [
    {
      key: 'index' as keyof Client,
      header: 'ID',
      icon: <Hash className="h-4 w-4 text-primary text-left" />,
    },
    {
      key: 'name' as keyof Client,
      header: "To'liq ism",
      icon: <User className="h-4 w-4 text-primary text-left" />,
      render: (client: Client) => (
        <span className="font-medium text-left">{client.name}</span>
      ),
    },
    {
      key: 'phone' as keyof Client,
      header: 'Telefon raqam',
      icon: <Phone className="h-4 w-4 text-primary text-left" />,
      width: '140px',
      render: (client: Client) => (
        <div className="flex justify-left">
          {client.phone ? (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {client.phone}
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
      key: 'debt' as any,
      header: 'Qarz',
      icon: <DollarSign className="h-4 w-4 text-primary text-left" />,
      width: '150px',
      headerAlign: 'left' as const,
      render: (client: Client) => {
        const debt = debtMap.get(client.id) || 0;
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
      key: 'createdAt' as keyof Client,
      header: 'Sana',
      icon: <Calendar className="h-4 w-4 text-primary text-left" />,
      width: '120px',
      headerAlign: 'left' as const,
      render: (client: Client) => (
        <div className="flex justify-left">
          <span className="text-sm">
            {new Date(client.createdAt).toLocaleDateString('uz-UZ')}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      icon: <MoreHorizontal className="h-4 w-4 text-primary text-left" />,
    },
  ];

  return (
    <UniversalPage
      header={{
        title: 'Mijozlar',
        description: "Mijozlar ro'yxati va ularning qarzlari",
        search: {
          value: search || '',
          placeholder: 'Mijozlarni qidirish',
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
      <UniversalTable<Client>
        data={filteredAndSortedData}
        isLoading={isFetching}
        columns={columns}
        total_pages={data?.totalPages}
        currentPage={pageNumber}
        pageSize={6}
        dropdownComponent={DropdownWrapper}
        emptyTitle="Mijoz topilmadi"
        emptyDescription="Qidiruv natijalariga mos keladigan mijoz mavjud emas. Filtrlarni o'zgartiring yoki boshqa kalit so'zlar bilan qayta urinib ko'ring."
        emptyIcon={<HandHelping className="h-8 w-8 text-muted-foreground" />}
        skeletonComponent={SkeletonRow}
        enableHoverEffect
        onRowClick={handleRowClick}
      />
    </UniversalPage>
  );
}
