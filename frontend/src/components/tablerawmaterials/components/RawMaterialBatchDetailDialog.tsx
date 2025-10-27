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
  Truck,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { NumericFormat } from 'react-number-format';

interface RawMaterialBatchDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: any | null;
}

export function RawMaterialBatchDetailDialog({
  open,
  onClose,
  item,
}: RawMaterialBatchDetailDialogProps) {
  if (!item) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            Xomashyo partiyasi tafsilotlari
          </DialogTitle>
          <DialogDescription>
            {item.rawMaterialName || 'Xomashyo'} partiyasi bo'yicha to'liq
            ma'lumot
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
                    Xomashyo nomi
                  </span>
                  <div className="text-sm mt-1 font-medium">
                    {item.rawMaterialName || "Noma'lum"}
                  </div>
                </div>

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
                    {Number(item.amount || 0).toLocaleString('uz-UZ')}{' '}
                    {item.rawMaterial?.type
                      ? measurementLabels[item.rawMaterial.type] ||
                        item.rawMaterial.type
                      : ''}
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Sotib olish narxi
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {Number(item.buyPrice || 0).toLocaleString('uz-UZ')} so'm
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Birlik narxi
                  </span>
                  <div className="text-sm mt-1 font-semibold">
                    {item.amount
                      ? Number(
                          (item.buyPrice || 0) / item.amount
                        ).toLocaleString('uz-UZ')
                      : '0'}{' '}
                    so'm
                  </div>
                </div>

                <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    To'lov holati
                  </span>
                  <div className="text-sm mt-1">
                    <Badge variant={item.paid ? 'default' : 'destructive'}>
                      {item.paid ? "To'langan" : "To'lanmagan"}
                    </Badge>
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

            {/* Exchange Rate */}
            {item.exchangeRate && (
              <section className="grid gap-3">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valyuta kursi
                </h4>
                <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Kurs
                      </span>
                      <div className="text-sm font-semibold">
                        {Number(item.exchangeRate).toLocaleString('uz-UZ')} so'm
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Valyutadagi narx
                      </span>
                      <div className="text-sm font-semibold">
                        {item.exchangeRate
                          ? Number(
                              (item.buyPrice || 0) / item.exchangeRate
                            ).toFixed(2)
                          : '0'}{' '}
                        USD
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Supplier Information */}
            {item.supplier && (
              <section className="grid gap-3">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Yetkazib beruvchi ma'lumotlari
                </h4>
                <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Kompaniya nomi
                      </span>
                      <div className="text-sm font-medium mt-1">
                        {item.supplier.name}
                      </div>
                    </div>
                    {item.supplier.phone && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Telefon raqami
                        </span>
                        <div className="text-sm font-medium mt-1">
                          {item.supplier.phone}
                        </div>
                      </div>
                    )}
                    {item.supplier.email && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Email
                        </span>
                        <div className="text-sm font-medium mt-1">
                          {item.supplier.email}
                        </div>
                      </div>
                    )}
                    {item.supplier.address && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Manzil
                        </span>
                        <div className="text-sm font-medium mt-1">
                          {item.supplier.address}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Payment Information */}
            {item.payment && (
              <section className="grid gap-3">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  To'lov ma'lumotlari
                </h4>
                <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Yetkazib beruvchi
                      </span>
                      <div className="text-sm font-medium mt-1">
                        {item.payment.supplierName}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground">
                        To'langan summa
                      </span>
                      <div className="text-sm font-semibold text-green-600 mt-1">
                        <NumericFormat
                          value={item.payment.paid}
                          displayType="text"
                          thousandSeparator=" "
                          suffix=" so'm"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground">
                        Dastlabki to'lov
                      </span>
                      <div className="text-sm font-medium mt-1">
                        <NumericFormat
                          value={item.payment.paidStatic}
                          displayType="text"
                          thousandSeparator=" "
                          suffix=" so'm"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground">
                        Joriy qarz
                      </span>
                      <div className="text-sm font-semibold text-red-600 mt-1">
                        <NumericFormat
                          value={item.payment.credit}
                          displayType="text"
                          thousandSeparator=" "
                          suffix=" so'm"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground">
                        Dastlabki qarz
                      </span>
                      <div className="text-sm font-medium mt-1">
                        <NumericFormat
                          value={item.payment.creditStatic}
                          displayType="text"
                          thousandSeparator=" "
                          suffix=" so'm"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground">
                        To'lov holati
                      </span>
                      <div className="text-sm mt-1">
                        <Badge 
                          variant={item.payment.credit === 0 ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {item.payment.credit === 0 ? "To'liq to'langan" : "Qisman to'langan"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Financial Summary */}
            <section className="grid gap-3">
              <Separator />
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Moliyaviy xulosasi
              </h4>
              <div className="rounded-md border border-border/40 bg-muted/10 px-4 py-3">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Umumiy xarajat
                    </span>
                    <div className="text-sm font-semibold">
                      {Number(item.buyPrice || 0).toLocaleString('uz-UZ')} so'm
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Birlik xarajati
                    </span>
                    <div className="text-sm font-semibold">
                      {item.amount
                        ? Number(
                            (item.buyPrice || 0) / item.amount
                          ).toLocaleString('uz-UZ')
                        : '0'}{' '}
                      so'm
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      To'lov holati
                    </span>
                    <div className="text-sm font-semibold">
                      <Badge
                        variant={item.paid ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {item.paid ? "To'langan" : "To'lanmagan"}
                      </Badge>
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
