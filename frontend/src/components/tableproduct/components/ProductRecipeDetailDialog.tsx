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
  ShoppingCart,
  Beaker,
  Layers,
} from 'lucide-react';

interface ProductRecipeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: any | null;
}

export function ProductRecipeDetailDialog({
  open,
  onClose,
  item,
}: ProductRecipeDetailDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            Mahsulot retsepti tafsilotlari
          </DialogTitle>
          <DialogDescription>
            {item.name} retsepti bo'yicha to'liq ma'lumot
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
                    Retsept nomi
                  </span>
                  <div className="text-sm mt-1 font-medium">{item.name}</div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    ID
                  </span>
                  <div className="text-sm mt-1 font-mono">
                    {item.id?.slice(0, 8)}...
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Olchov birligi
                  </span>
                  <div className="text-sm mt-1 font-medium">
                    {measurementLabels[item.type] || item.type}
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Yarim tayyor mahsulotlar soni
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {item.units?.length || 0} ta
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

            {/* Recipe Units */}
            {item.units && item.units.length > 0 && (
              <section className="grid gap-4">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Retsept tarkibi ({item.units.length} ta yarim tayyor mahsulot)
                </h4>
                <div className="grid gap-3">
                  {item.units.map((unit: any, index: number) => (
                    <div
                      key={unit.id || index}
                      className="rounded-md border border-border/40 bg-muted/10 px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Yarim tayyor mahsulot #{index + 1}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {date(unit.createdAt)}
                        </Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Mahsulot nomi
                          </span>
                          <div className="text-sm font-medium">
                            {unit.semiProduct?.name ||
                              "Noma'lum yarim tayyor mahsulot"}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground">
                            Kerakli miqdor
                          </span>
                          <div className="text-sm font-semibold">
                            {Number(unit.amount || 0).toLocaleString('uz-UZ')}{' '}
                            {unit.semiProduct
                              ? measurementLabels[unit.semiProduct.type] ??
                                unit.semiProduct.type
                              : ''}
                          </div>
                        </div>
                      </div>

                      {/* Available Batches */}
                      {unit.batches && unit.batches.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <span className="text-xs text-muted-foreground mb-2 block">
                            Mavjud partiyalar ({unit.batches.length} ta):
                          </span>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {unit.batches.map(
                              (batch: any, batchIndex: number) => (
                                    <div
                                      key={batch.id || batchIndex}
                                      className="flex items-center justify-between text-xs bg-background/50 rounded px-2 py-1"
                                    >
                                      <div>
                                        <div className="font-medium">
                                          {Number(
                                            batch.amount || 0
                                          ).toLocaleString('uz-UZ')}{' '}
                                          {unit.semiProduct
                                            ? measurementLabels[
                                                unit.semiProduct.type
                                              ] ?? unit.semiProduct.type
                                            : ''}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {Number(batch.cost || 0).toLocaleString(
                                        'uz-UZ'
                                      )}{' '}
                                      so'm
                                    </div>
                                  </div>
                                  <div className="text-muted-foreground">
                                    {date(batch.createdAt)}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* No Batches Available */}
                      {(!unit.batches || unit.batches.length === 0) && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <div className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                            ⚠️ Bu yarim tayyor mahsulot uchun partiya mavjud
                            emas
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recipe Summary */}
            {item.units && item.units.length > 0 && (
              <section className="grid gap-3">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Retsept xulosasi
                </h4>
                <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                  <div className="grid gap-2 md:grid-cols-3">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Jami yarim tayyor mahsulotlar
                      </span>
                      <div className="text-sm font-semibold">
                        {item.units.length} ta
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Mavjud mahsulotlar
                      </span>
                      <div className="text-sm font-semibold">
                        {
                          item.units.filter(
                            (unit: any) =>
                              unit.batches && unit.batches.length > 0
                          ).length
                        }{' '}
                        ta
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Yetishmayotgan mahsulotlar
                      </span>
                      <div className="text-sm font-semibold text-amber-600">
                        {
                          item.units.filter(
                            (unit: any) =>
                              !unit.batches || unit.batches.length === 0
                          ).length
                        }{' '}
                        ta
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Production Readiness */}
            {item.units && item.units.length > 0 && (
              <section className="grid gap-3">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Ishlab chiqarishga tayyorlik
                </h4>
                <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                  {(() => {
                    const availableUnits = item.units.filter(
                      (unit: any) => unit.batches && unit.batches.length > 0
                    );
                    const missingUnits = item.units.filter(
                      (unit: any) => !unit.batches || unit.batches.length === 0
                    );
                    const readinessPercentage = (
                      (availableUnits.length / item.units.length) *
                      100
                    ).toFixed(1);

                    return (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Tayyorlik darajasi
                          </span>
                          <Badge
                            variant={
                              readinessPercentage === '100.0'
                                ? 'default'
                                : readinessPercentage === '0.0'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className="text-xs"
                          >
                            {readinessPercentage}%
                          </Badge>
                        </div>

                        {missingUnits.length > 0 && (
                          <div>
                            <span className="text-xs text-muted-foreground mb-2 block">
                              Yetishmayotgan yarim tayyor mahsulotlar:
                            </span>
                            <div className="grid gap-1">
                              {missingUnits.map((unit: any, index: number) => (
                                <div
                                  key={unit.id || index}
                                  className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1"
                                >
                                  •{' '}
                                  {unit.semiProduct?.name ||
                                    "Noma'lum mahsulot"}{' '}
                                  -{' '}
                                  {Number(unit.amount || 0).toLocaleString(
                                    'uz-UZ'
                                  )}{' '}
                                  ta kerak
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </section>
            )}

            {/* Empty State */}
            {(!item.units || item.units.length === 0) && (
              <section className="grid gap-4">
                <Separator />
                <div className="text-center py-8 text-muted-foreground">
                  <Beaker className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Bu retseptda hech qanday yarim tayyor mahsulot yo'q
                  </p>
                  <p className="text-xs">
                    Retseptni tahrirlash uchun "Tahrirlash" tugmasini bosing
                  </p>
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
