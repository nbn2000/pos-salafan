import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { date } from '@/lib/utils';
import {
  Calendar,
  ShoppingCart,
  Package,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Settings,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernProductCardProps {
  product: ProductWithBatches;
  onView?: (product: ProductWithBatches) => void;
  onEdit?: (product: ProductWithBatches) => void;
  onDelete?: (product: ProductWithBatches) => void;
  onAddBatch?: (product: ProductWithBatches) => void;
}

export function ModernProductCard({
  product,
  onView,
  onEdit,
  onDelete,
  onAddBatch,
}: ModernProductCardProps) {
  const latestBatch = product.batches?.[0];
  const totalProfit =
    product.batches?.reduce((sum, batch) => {
      return sum + ((batch.sellPrice || 0) - batch.cost) * batch.amount;
    }, 0) || 0;

  const averageProfit = product.batches?.length
    ? totalProfit /
      product.batches.reduce((sum, batch) => sum + batch.amount, 0)
    : 0;

  const profitColor =
    averageProfit > 0
      ? 'text-green-600'
      : averageProfit < 0
        ? 'text-red-600'
        : 'text-muted-foreground';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-background/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
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
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                ID: {product.id.slice(0, 8)}...
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView?.(product)}>
                <Eye className="h-4 w-4 mr-2" />
                Ko'rish
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddBatch?.(product)}>
                <Package className="h-4 w-4 mr-2" />
                Partiya qo'shish
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(product)}>
                <Edit className="h-4 w-4 mr-2" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(product)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stock and Batches */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {Number(product.totalBatchAmount || 0).toLocaleString('uz-UZ')}
            </div>
            <div className="text-xs text-muted-foreground">Umumiy miqdor</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {product.batches?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Partiyalar</div>
          </div>
        </div>

        {/* Latest Batch Info */}
        {latestBatch && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Oxirgi partiya
            </p>
            <div className="bg-muted/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Miqdor:</span>
                <span className="font-medium">
                  {Number(latestBatch.amount).toLocaleString('uz-UZ')} dona
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Xarajat:</span>
                <span className="font-medium">
                  {Number(latestBatch.cost).toLocaleString('uz-UZ')} so'm
                </span>
              </div>
              {latestBatch.sellPrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sotuv narxi:</span>
                  <span className="font-medium">
                    {Number(latestBatch.sellPrice).toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profit Analysis */}
        {product.batches && product.batches.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">O'rtacha foyda</span>
            </div>
            <div className={`text-sm font-bold ${profitColor}`}>
              {averageProfit > 0 ? '+' : ''}
              {Number(averageProfit).toLocaleString('uz-UZ')} so'm
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={
              product.batches && product.batches.length > 0
                ? 'default'
                : 'secondary'
            }
          >
            {product.batches && product.batches.length > 0
              ? 'Mavjud'
              : 'Tugagan'}
          </Badge>
          {latestBatch?.sellPrice && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200"
            >
              Narx belgilangan
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/30">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date(product.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddBatch?.(product)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Package className="h-3 w-3 mr-1" />
              Partiya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(product)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Batafsil
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
