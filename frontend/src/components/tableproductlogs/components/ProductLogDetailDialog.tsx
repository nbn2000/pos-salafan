import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { date } from '@/lib/utils';
import {
  Calendar,
  Package,
  MessageSquare,
  Hash,
  FileText,
  Clock,
  User,
  Activity,
} from 'lucide-react';

interface ProductLogDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: ProductStockLog | null;
}

export function ProductLogDetailDialog({
  open,
  onClose,
  item,
}: ProductLogDetailDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Mahsulot Log Tafsilotlari
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Log ID: {item.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <section className="grid gap-4">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Asosiy Ma'lumotlar
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Log ID
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {item.id}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Yaratilgan Sana
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{date(item.createdAt)}</span>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Product Information */}
          <section className="grid gap-4">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Mahsulot Ma'lumotlari
            </h4>

            <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mahsulot Nomi</span>
                  <span className="text-sm text-foreground">{item.productName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mahsulot ID</span>
                  <Badge variant="secondary" className="text-xs font-mono">{item.productId.slice(0, 8)}...</Badge>
                </div>

                {item.productBatchId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Partiya ID</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {item.productBatchId.slice(0, 8)}...
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Log Details */}
          <section className="grid gap-4">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Log Tafsilotlari
            </h4>

            <div className="space-y-4">
              {/* Log Type */}
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Log Turi</span>
                </div>
                <Badge variant={item.productBatchId ? 'default' : 'secondary'}>
                  {item.productBatchId ? 'Partiya Logi' : 'Umumiy Log'}
                </Badge>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Izoh
                </span>
                <div className="min-h-16 p-3 bg-muted/10 rounded-lg border border-border/30">
                  {item.comment ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {item.comment}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Hech qanday izoh qoldirilmagan
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Timestamp Information */}
          <section className="grid gap-4">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Vaqt Ma'lumotlari
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Yaratilgan
                </div>
                <div className="text-sm font-medium">
                  {new Date(item.createdAt).toLocaleString('uz-UZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              </div>

              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Necha vaqt oldin
                </div>
                <div className="text-sm font-medium">
                  {(() => {
                    const now = new Date();
                    const created = new Date(item.createdAt);
                    const diffMs = now.getTime() - created.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMinutes = Math.floor(diffMs / (1000 * 60));

                    if (diffDays > 0) return `${diffDays} kun oldin`;
                    if (diffHours > 0) return `${diffHours} soat oldin`;
                    if (diffMinutes > 0) return `${diffMinutes} daqiqa oldin`;
                    return 'Hozirgina';
                  })()}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t border-border/50">
          <Button onClick={onClose} variant="outline">
            Yopish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
