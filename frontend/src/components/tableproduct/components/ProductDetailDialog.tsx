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
  Barcode,
} from 'lucide-react';

interface ProductDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: ProductWithBatches | null;
}

export function ProductDetailDialog({
  open,
  onClose,
  item,
}: ProductDetailDialogProps) {
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
            <ShoppingCart className="h-5 w-5 text-primary" />
            Mahsulot tafsilotlari
          </DialogTitle>
          <DialogDescription>
            {item.name} bo'yicha to'liq ma'lumot
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
                    Mahsulot nomi
                  </span>
                  <div className="text-sm mt-1 font-medium">{item.name}</div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    ID
                  </span>
                  <div className="text-sm mt-1 font-mono">
                    {item.id.slice(0, 8)}...
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Retseptlar soni
                  </span>
                  <div className="text-sm mt-1 font-medium">
                    {0} ta {/* recipe not available in ProductBatchView */}
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Umumiy miqdor
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {Number(item.totalBatchAmount || 0).toLocaleString('uz-UZ')}{' '}
                    dona
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Partiyalar soni
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {item.batches?.length || 0} ta
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

            {/* Images */}
            {false && ( // images not available in ProductWithBatches
              <section className="grid gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Rasmlar
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Jami: 0 {/* images not available */}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[].map((image: any, index: number) => { // images not available
                    const baseUrl =
                      import.meta.env.VITE_BASE_URL?.split('api')[0] ?? '';
                    const imageUrl = `${baseUrl}${image.url}`;
                    return (
                      <div
                        key={image.url + index}
                        className="overflow-hidden rounded-lg border border-border/50 bg-background"
                      >
                        <img
                          src={imageUrl}
                          alt={`${item?.name || 'Product'} rasm ${index + 1}`}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Batches */}
            {item.batches && item.batches.length > 0 && (
              <section className="grid gap-4">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Partiyalar ({item.batches.length} ta)
                </h4>
                <div className="grid gap-3">
                  {item.batches.map((batch, index) => (
                    <div
                      key={batch.id}
                      className="rounded-md border border-border/40 bg-muted/10 px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Partiya #{index + 1}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {date(batch.createdAt)}
                        </Badge>
                      </div>

                      <div className="grid gap-2 md:grid-cols-4">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Miqdor
                          </span>
                          <div className="text-sm font-medium">
                            {Number(batch.amount).toLocaleString('uz-UZ')} dona
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground">
                            Ishlab chiqarish xarajati
                          </span>
                          <div className="text-sm font-medium">
                            {Number(batch.cost).toLocaleString('uz-UZ')} so'm
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground">
                            Sotuv narxi
                          </span>
                          <div className="text-sm font-medium">
                            {batch.sellPrice
                              ? Number(batch.sellPrice).toLocaleString(
                                  'uz-UZ'
                                ) + " so'm"
                              : 'Belgilanmagan'}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground">
                            Foyda
                          </span>
                          <div className="text-sm font-medium">
                            {batch.sellPrice
                              ? `${Number(batch.sellPrice - (batch.cost || 0)).toLocaleString('uz-UZ')} so'm`
                              : 'Hisoblanmagan'}
                          </div>
                        </div>
                      </div>

                      {false && ( // recipe not available in ProductBatchView
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <span className="text-xs text-muted-foreground mb-2 block">
                            Ishlatilgan retsept: {/* recipe not available */}
                          </span>

                          {/* Recipe Units/Ingredients */}
                          {false && // recipe not available
                            false && (
                              <div className="mt-2">
                                <span className="text-xs text-muted-foreground mb-2 block">
                                  Retsept tarkibi:
                                </span>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {[].map((unit: any) => ( // recipe not available
                                    <div
                                      key={unit.id}
                                      className="flex items-center justify-between text-xs bg-background/50 rounded px-2 py-1"
                                    >
                                      <span className="font-medium">
                                        {unit.semiProduct?.name ||
                                          "Noma'lum ingredient"}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {Number(unit.amount).toLocaleString(
                                          'uz-UZ'
                                        )}{' '}
                                        {unit.semiProduct
                                          ? measurementLabels[
                                              unit.semiProduct.type
                                            ] ?? unit.semiProduct.type
                                          : ''}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Latest Price Info */}
            {item.batches && item.batches.length > 0 && (
              <section className="grid gap-3">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Oxirgi narx ma'lumotlari
                </h4>
                <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                  {(() => {
                    const latest = item.batches[0];
                    return (
                      <div className="grid gap-2 md:grid-cols-4">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Oxirgi ishlab chiqarish xarajati
                          </span>
                          <div className="text-sm font-semibold">
                            {Number(latest.cost).toLocaleString('uz-UZ')} so'm
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Oxirgi sotuv narxi
                          </span>
                          <div className="text-sm font-semibold">
                            {latest.sellPrice
                              ? Number(latest.sellPrice).toLocaleString(
                                  'uz-UZ'
                                ) + " so'm"
                              : 'Belgilanmagan'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Birlik foydasi
                          </span>
                          <div className="text-sm font-semibold">
                            {latest.sellPrice
                              ? `${Number(latest.sellPrice - (latest.cost || 0)).toLocaleString('uz-UZ')} so'm`
                              : 'Hisoblanmagan'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Oxirgi yangilanish
                          </span>
                          <div className="text-sm">
                            {date(latest.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </section>
            )}

            {/* Empty State */}
            {(!item.batches || item.batches.length === 0) && (
              <section className="grid gap-4">
                <Separator />
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Hech qanday partiya mavjud emas</p>
                  <p className="text-xs">
                    Yangi partiya qo'shish uchun "Partiya qo'shish" tugmasini
                    bosing
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
