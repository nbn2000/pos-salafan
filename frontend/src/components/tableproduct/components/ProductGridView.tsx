import { useState } from 'react';
import { ModernProductCard } from './ModernProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Grid,
  List,
  Search,
  Filter,
  Plus,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProductGridViewProps {
  products: ProductWithBatches[];
  isLoading: boolean;
  onAddNew: () => void;
  onView: (product: ProductWithBatches) => void;
  onEdit: (product: ProductWithBatches) => void;
  onDelete: (product: ProductWithBatches) => void;
  onAddBatch: (product: ProductWithBatches) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function ProductGridView({
  products,
  isLoading,
  onAddNew,
  onView,
  onEdit,
  onDelete,
  onAddBatch,
  searchValue,
  onSearchChange,
}: ProductGridViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'stock' | 'profit'>(
    'date'
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const hasStock = product.batches && product.batches.length > 0;

      let matchesStatus = true;
      if (filterStatus === 'in_stock') matchesStatus = hasStock;
      if (filterStatus === 'out_of_stock') matchesStatus = !hasStock;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return (b.totalBatchAmount || 0) - (a.totalBatchAmount || 0);
        case 'profit':
          const profitA =
            a.batches?.reduce(
              (sum, batch) =>
                sum + ((batch.sellPrice || 0) - batch.cost) * batch.amount,
              0
            ) || 0;
          const profitB =
            b.batches?.reduce(
              (sum, batch) =>
                sum + ((batch.sellPrice || 0) - batch.cost) * batch.amount,
              0
            ) || 0;
          return profitB - profitA;
        case 'date':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const inStockCount = products.filter(
    (p) => p.batches && p.batches.length > 0
  ).length;
  const outOfStockCount = products.length - inStockCount;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Mahsulotlar</h2>
            <Badge variant="secondary" className="ml-2">
              {filteredProducts.length}
            </Badge>
          </div>

          {/* Status Summary */}
          <div className="flex items-center gap-2 text-sm">
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 border-green-200"
            >
              {inStockCount} mavjud
            </Badge>
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-800 border-red-200"
            >
              {outOfStockCount} tugagan
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button onClick={onAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Yangi Mahsulot
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulot qidirish..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Holat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="in_stock">Mavjud</SelectItem>
              <SelectItem value="out_of_stock">Tugagan</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Saralash" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sana bo'yicha</SelectItem>
              <SelectItem value="name">Nom bo'yicha</SelectItem>
              <SelectItem value="stock">Zaxira bo'yicha</SelectItem>
              <SelectItem value="profit">Foyda bo'yicha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Mahsulot topilmadi
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Qidiruv natijalariga mos mahsulot mavjud emas
          </p>
          <Button onClick={onAddNew} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Birinchi mahsulotni yarating
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ModernProductCard
              key={product.id}
              product={product}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddBatch={onAddBatch}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="p-4 border border-border/50 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {product.images && product.images.length > 0 ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50">
                      <img
                        src={`${import.meta.env.VITE_BASE_URL?.split('api')[0] ?? ''}${product.images[0].url}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {Number(product.totalBatchAmount || 0).toLocaleString(
                        'uz-UZ'
                      )}{' '}
                      dona •{product.batches?.length || 0} partiya
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddBatch(product)}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Partiya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(product)}
                  >
                    Ko'rish
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    Tahrirlash
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
