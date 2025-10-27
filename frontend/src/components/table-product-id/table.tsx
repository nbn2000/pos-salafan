// components/products/TableProductBatchesByProduct.tsx
import { useGetProductBatchesByProductQuery } from '@/api/products/product-batch';
import SkeletonRow from '@/components/skeleton/products';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Box,
  Calendar,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { UniversalContent } from '../common/UniversalContent';
import { UniversalPage } from '../common/UniversalPage';
import { UniversalTable } from '../common/UniversalTable';
import AddButtonComponent from './components/btn/addProductBatch';
import Dropdown from './components/btn/Dropdown';

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatNum(n?: number) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('uz-UZ').format(n);
}

export default function TableProductBatchesByProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const searchParams = new URLSearchParams(location.search);
  const pageNumber = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';

  const { data, isFetching } = useGetProductBatchesByProductQuery({
    productId: productId || '',
    page: pageNumber,
    take: 6,
    search: search || undefined,
    sortField: 'createdAt',
    sortOrder: 'DESC',
  });

  // Dropdown o‘rami (row click bilan to‘qnashmasin)
  const DropdownWrapper = ({
    item,
    onRowClick,
  }: {
    item: ProductBatch;
    onRowClick: (e: React.MouseEvent) => void;
  }) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onRowClick(e);
      }}
    >
      {/* Sizdagi Dropdown props nomlari qanday bo‘lsa, shunga moslang */}
      <Dropdown product={item} />
    </div>
  );

  // Calculate batch statistics
  const totalBatches = data?.results?.length || 0;
  const totalAmount =
    data?.results?.reduce((sum, batch) => sum + batch.amount, 0) || 0;
  const totalCost =
    data?.results?.reduce((sum, batch) => sum + batch.cost * batch.amount, 0) ||
    0;
  const totalRevenue =
    data?.results?.reduce(
      (sum, batch) => sum + (batch.sellPrice || 0) * batch.amount,
      0
    ) || 0;
  const totalProfit = totalRevenue - totalCost;

  const BatchStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{totalBatches}</div>
        <div className="text-xs text-muted-foreground">Jami partiyalar</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {formatNum(totalAmount)}
        </div>
        <div className="text-xs text-muted-foreground">Jami miqdor</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {formatNum(totalCost)}
        </div>
        <div className="text-xs text-muted-foreground">Jami xarajat (so'm)</div>
      </div>
      <div className="text-center">
        <div
          className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {totalProfit >= 0 ? '+' : ''}
          {formatNum(totalProfit)}
        </div>
        <div className="text-xs text-muted-foreground">Jami foyda (so'm)</div>
      </div>
    </div>
  );

  // Enhanced columns with professional details
  const columns = [
    {
      key: 'batchId' as const,
      header: 'Partiya ID',
      icon: <Box className="h-4 w-4 text-primary" />,
      render: (item: ProductBatch) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-muted-foreground">
            #{item.id.slice(0, 8)}...
          </span>
        </div>
      ),
    },
    {
      key: 'amount' as const,
      header: 'Miqdor',
      icon: <Box className="h-4 w-4 text-primary" />,
      render: (item: ProductBatch) => (
        <div className="flex flex-col">
          <span className="font-semibold">{formatNum(item.amount)}</span>
          <span className="text-xs text-muted-foreground">dona</span>
        </div>
      ),
    },
    {
      key: 'cost' as const,
      header: 'Xarajat (dona)',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      render: (item: ProductBatch) => (
        <div className="flex flex-col">
          <span className="font-semibold">{formatNum(item.cost)} so'm</span>
          <span className="text-xs text-orange-600">
            Jami: {formatNum(item.cost * item.amount)} so'm
          </span>
        </div>
      ),
    },
    {
      key: 'sellPrice' as const,
      header: 'Sotuv narxi (dona)',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      render: (item: ProductBatch) => (
        <div className="flex flex-col">
          <span className="font-semibold">
            {formatNum(item.sellPrice || 0)} so'm
          </span>
          <span className="text-xs text-green-600">
            Jami: {formatNum((item.sellPrice || 0) * item.amount)} so'm
          </span>
        </div>
      ),
    },
    {
      key: 'profit' as const,
      header: 'Foyda',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      render: (item: ProductBatch) => {
        const profitPerUnit = (item.sellPrice || 0) - item.cost;
        const totalBatchProfit = profitPerUnit * item.amount;
        const profitColor =
          profitPerUnit >= 0 ? 'text-green-600' : 'text-red-600';
        const profitMargin = item.sellPrice
          ? (profitPerUnit / item.sellPrice) * 100
          : 0;

        return (
          <div className="flex flex-col">
            <span className={`font-semibold ${profitColor}`}>
              {profitPerUnit >= 0 ? '+' : ''}
              {formatNum(profitPerUnit)} so'm
            </span>
            <span className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% margin
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt' as const,
      header: 'Ishlab chiqarilgan',
      icon: <Calendar className="h-4 w-4 text-primary" />,
      render: (item: ProductBatch) => {
        const now = new Date();
        const created = new Date(item.createdAt);
        const diffDays = Math.floor(
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {formatDate(item.createdAt)}
            </span>
            <span className="text-xs text-muted-foreground">
              {diffDays === 0
                ? 'Bugun'
                : diffDays === 1
                  ? 'Kecha'
                  : `${diffDays} kun oldin`}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions' as const,
      header: 'Amallar',
      icon: <MoreHorizontal className="h-4 w-4 text-primary" />,
    },
  ];

  const BackNavigation = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(`/products`)}
      className="h-8 w-8 p-0 hover:bg-primary/10 mr-2"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );

  return (
    <UniversalPage
      header={{
        title: 'Mahsulot Partiyalari',
        description:
          "Batafsil partiya ma'lumotlari, foyda tahlili va ishlab chiqarish hisoboti",
        icon: <Box className="w-5 h-5 text-primary" />,
        search: {
          value: search,
          placeholder: "Partiya ID, narx yoki sana bo'yicha qidirish...",
        },
        actions: (
          <>
            <BackNavigation />
            <AddButtonComponent
              productRecipeId={data?.results?.find((batch) => batch.productRecipeId)?.productRecipeId}
            />
          </>
        ),
        showFullscreen: true,
      }}
      filters={{ showFilter: false, onShowFilterChange: () => {} }}
      showBreadcrumb={true}
    >
      <BatchStats />
      <UniversalContent
        isLoading={isFetching}
        data={data?.results || []}
        showPagination={true}
        totalPages={data?.totalPages || 0}
      >
        <UniversalTable<ProductBatch>
          data={data?.results || []}
          total_pages={data?.totalPages || 0}
          isLoading={isFetching}
          columns={columns}
          dropdownComponent={DropdownWrapper}
          emptyTitle="Partiyalar topilmadi"
          emptyDescription="Bu mahsulot uchun hali partiyalar qo'shilmagan"
          emptyIcon={<Box className="h-8 w-8 text-muted-foreground" />}
          skeletonComponent={SkeletonRow}
          enableHoverEffect={true}
        />
      </UniversalContent>
    </UniversalPage>
  );
}
