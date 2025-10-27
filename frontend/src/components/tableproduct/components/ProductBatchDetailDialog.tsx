import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { date } from '@/lib/utils';
import {
  Calendar,
  Package,
  Hash,
  DollarSign,
  ShoppingCart,
  Box,
  Beaker,
  TrendingUp,
} from 'lucide-react';

interface ProductBatchDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: any | null;
}

export function ProductBatchDetailDialog({
  open,
  onClose,
  item,
}: ProductBatchDetailDialogProps) {
  if (!item) {
    return null;
  }

  const measurementLabels: Record<string, string> = {
    KG: 'Kilogram',
    UNIT: 'Dona',
    L: 'Litr',
    M: 'Metr',
    PIECE: 'Dona',
  };

  const profit = (item.sellPrice || 0) - (item.cost || 0);
  const profitMargin = item.sellPrice
    ? ((profit / item.sellPrice) * 100).toFixed(1)
    : '0';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Mahsulot partiyasi tafsilotlari
          </DialogTitle>
          <DialogDescription>
            Partiya #{item.id?.slice(0, 8)}... bo'yicha to'liq ma'lumot
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <section className="grid gap-3">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Asosiy ma'lumotlar
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Partiya ID
                  </span>
                  <div className="text-sm mt-1 font-mono">
                    {item.id?.slice(0, 8)}...
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Miqdor
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {Number(item.amount || 0).toLocaleString('uz-UZ')} dona
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Ishlab chiqarish xarajati
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {Number(item.cost || 0).toLocaleString('uz-UZ')} so'm
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Sotuv narxi
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {item.sellPrice
                      ? Number(item.sellPrice).toLocaleString('uz-UZ') + " so'm"
                      : 'Belgilanmagan'}
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Birlik xarajati
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {item.amount
                      ? Number((item.cost || 0) / item.amount).toLocaleString(
                          'uz-UZ'
                        )
                      : '0'}{' '}
                    so'm
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Birlik foydasi
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {item.sellPrice
                      ? Number(profit / (item.amount || 1)).toLocaleString(
                          'uz-UZ'
                        ) + " so'm"
                      : 'Hisoblanmagan'}
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Yaratilgan sana
                  </span>
                  <div className="text-sm mt-1">{date(item.createdAt)}</div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Yangilangan sana
                  </span>
                  <div className="text-sm mt-1">{date(item.updatedAt)}</div>
                </div>
              </div>
            </section>

            {/* Recipe Information */}
            {item.recipe && (
              <section className="grid gap-4">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Beaker className="h-4 w-4" />
                  Ishlatilgan retsept
                </h4>
                <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Retsept nomi
                      </span>
                      <div className="text-sm font-medium mt-1">
                        {item.recipe.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Olchov birligi
                      </span>
                      <div className="text-sm font-medium mt-1">
                        {measurementLabels[item.recipe.type] ||
                          item.recipe.type}
                      </div>
                    </div>
                  </div>

                  {/* Recipe Units */}
                  {item.recipe.units && item.recipe.units.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <span className="text-xs text-muted-foreground mb-3 block">
                        Retsept tarkibi ({item.recipe.units.length} ta yarim
                        tayyor mahsulot):
                      </span>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {item.recipe.units.map((unit: any, index: number) => (
                          <div
                            key={unit.id || index}
                            className="flex items-center justify-between text-xs bg-background/50 rounded px-3 py-2"
                          >
                            <div>
                              <div className="font-medium">
                                {unit.semiProduct?.name ||
                                  "Noma'lum yarim tayyor mahsulot"}
                              </div>
                              <div className="text-muted-foreground">
                                Mavjud: {unit.batches?.length || 0} ta partiya
                              </div>
                            </div>
                            <div className="font-semibold">
                              {Number(unit.amount || 0).toLocaleString(
                                'uz-UZ'
                              )}{' '}
                              {unit.semiProduct
                                ? measurementLabels[unit.semiProduct.type] ??
                                  unit.semiProduct.type
                                : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Financial Analysis */}
            {item.sellPrice && (
              <section className="grid gap-3">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Moliyaviy tahlil
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                    <div className="grid gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Umumiy foyda
                        </span>
                        <div className="text-lg font-bold text-green-600">
                          {Number(profit).toLocaleString('uz-UZ')} so'm
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Foyda marjasi
                        </span>
                        <div className="text-sm font-semibold">
                          {profitMargin}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                    <div className="grid gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Birlik foydasi
                        </span>
                        <div className="text-lg font-bold text-green-600">
                          {item.amount
                            ? Number(profit / item.amount).toLocaleString(
                                'uz-UZ'
                              )
                            : '0'}{' '}
                          so'm
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          ROI (Foyda darajasi)
                        </span>
                        <div className="text-sm font-semibold">
                          {item.cost
                            ? ((profit / item.cost) * 100).toFixed(1)
                            : '0'}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Cost Breakdown */}
            <section className="grid gap-3">
              <Separator />
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Xarajat tafsiloti
              </h4>
              <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                <div className="grid gap-2 md:grid-cols-4">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Umumiy xarajat
                    </span>
                    <div className="text-sm font-semibold">
                      {Number(item.cost || 0).toLocaleString('uz-UZ')} so'm
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Birlik xarajati
                    </span>
                    <div className="text-sm font-semibold">
                      {item.amount
                        ? Number((item.cost || 0) / item.amount).toLocaleString(
                            'uz-UZ'
                          )
                        : '0'}{' '}
                      so'm
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Sotuv narxi
                    </span>
                    <div className="text-sm font-semibold">
                      {item.sellPrice
                        ? Number(item.sellPrice).toLocaleString('uz-UZ') +
                          " so'm"
                        : 'Belgilanmagan'}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Ishlab chiqarilgan
                    </span>
                    <div className="text-sm font-semibold">
                      {Number(item.amount || 0).toLocaleString('uz-UZ')} dona
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
