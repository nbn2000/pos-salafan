import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { measurementLabels } from '@/lib/measurementUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { date } from '@/lib/utils';
import {
  Calendar,
  Package,
  Hash,
  DollarSign,
  FlaskConical,
  Box,
  CreditCard,
} from 'lucide-react';
import { NumericFormat } from 'react-number-format';
interface RawMaterialDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: any | null; // Using any for now to avoid type conflicts
}

export function RawMaterialDetailDialog({
  open,
  onClose,
  item,
}: RawMaterialDetailDialogProps) {
  if (!item) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Xomashyo tafsilotlari
          </DialogTitle>
          <DialogDescription>
            {item.material.name} bo'yicha to'liq ma'lumot
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
                    Nomi
                  </span>
                  <div className="text-sm mt-1 font-medium">
                    {item.material.name}
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    ID
                  </span>
                  <div className="text-sm mt-1 font-mono">
                    {item.material.id.slice(0, 8)}...
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Olchov birligi
                  </span>
                  <div className="text-sm mt-1 font-medium">
                    {measurementLabels[item.material.type] ||
                      item.material.type}
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Umumiy miqdor
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {Number(item.totalBatchAmount || 0).toLocaleString('uz-UZ')}{' '}
                    {measurementLabels[item.material.type] ||
                      item.material.type}
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Yaratilgan sana
                  </span>
                  <div className="text-sm mt-1">
                    {date(item.material.createdAt)}
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
              </div>
            </section>

            {/* Images */}
            {item.material.images && item.material.images.length > 0 && (
              <section className="grid gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Rasmlar
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Jami: {item.material.images.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {item.material.images.map((image: any, index: number) => {
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
                          alt={`${item.material.name} rasm ${index + 1}`}
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
                  {item.batches.map((batch: any, index: number) => (
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
                            {Number(batch.amount).toLocaleString('uz-UZ')}{' '}
                            {measurementLabels[item.material.type] ||
                              item.material.type}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground">
                            Sotib olish narxi
                          </span>
                          <div className="text-sm font-medium">
                            {Number(batch.buyPrice).toLocaleString('uz-UZ')}{' '}
                            so'm
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-muted-foreground">
                            ID
                          </span>
                          <div className="text-sm font-medium">
                            {batch?.id?.split('-')[0] ?? '-'}
                          </div>
                        </div>

                        {batch.exchangeRate && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Valyuta kursi
                            </span>
                            <div className="text-sm font-medium">
                              {Number(batch.exchangeRate).toLocaleString(
                                'uz-UZ'
                              )}{' '}
                              so'm
                            </div>
                          </div>
                        )}
                      </div>

                      {batch.supplier && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <span className="text-xs text-muted-foreground mb-1 block">
                            Yetkazib beruvchi:
                          </span>
                          <div className="text-sm font-medium">
                            {batch.supplier.name}
                          </div>
                          {batch.supplier.phone && (
                            <div className="text-xs text-muted-foreground">
                              Tel: {batch.supplier.phone}
                            </div>
                          )}
                        </div>
                      )}

                      {batch.payment && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              To'lov ma'lumotlari:
                            </span>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <span className="text-xs text-muted-foreground">
                                To'langan:
                              </span>
                              <div className="text-sm font-medium text-green-600">
                                <NumericFormat
                                  value={batch.payment.paid}
                                  displayType="text"
                                  thousandSeparator=" "
                                  suffix=" so'm"
                                />
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Qarz:
                              </span>
                              <div className="text-sm font-medium text-red-600">
                                <NumericFormat
                                  value={batch.payment.credit}
                                  displayType="text"
                                  thousandSeparator=" "
                                  suffix=" so'm"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-1">
                            <Badge 
                              variant={batch.payment.credit === 0 ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {batch.payment.credit === 0 ? "To'liq to'langan" : "Qisman to'langan"}
                            </Badge>
                          </div>
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
                      <div className="grid gap-2 md:grid-cols-3">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Oxirgi sotib olish narxi
                          </span>
                          <div className="text-sm font-semibold">
                            {Number(latest.buyPrice).toLocaleString('uz-UZ')}{' '}
                            so'm
                          </div>
                        </div>
                        {latest.exchangeRate && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Oxirgi sotib olish narxi (dollar)
                            </span>
                            <div className="text-sm font-semibold">
                              {Number(
                                latest.buyPrice / latest.exchangeRate
                              ).toLocaleString('en-US', {
                                minimumFractionDigits: 4,
                                maximumFractionDigits: 4,
                              })}{' '}
                              dollar/
                              {measurementLabels[item.material.type] ||
                                item.material.type}
                            </div>
                          </div>
                        )}
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
                  <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
