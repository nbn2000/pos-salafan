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
import { date, formatQuantity } from '@/lib/utils';
import { useMemo } from 'react';

interface ResourceDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: Record<string, unknown> | null;
  title?: string;
  description?: string;
}

const isPrimitive = (value: unknown): boolean =>
  value === null || ['string', 'number', 'boolean'].includes(typeof value);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isIsoDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}(T|$)/.test(value);

const formatLabel = (key: string): string => {
  // Uzbek translations for common property names
  const translations: Record<string, string> = {
    id: 'ID',
    name: 'Nomi',
    type: 'Turi',
    amount: 'Miqdori',
    price: 'Narxi',
    buyPrice: 'Sotib olish narxi',
    sellPrice: 'Sotish narxi',
    paid: 'Tolangan',
    exchangeRate: 'Valyuta kursi',
    supplierId: 'Yetkazib beruvchi ID',
    rawMaterialId: 'Xomashyo ID',
    rawMaterialName: 'Xomashyo nomi',
    createdAt: 'Yaratilgan',
    updatedAt: 'Yangilangan',
    totalBatchAmount: 'Umumiy miqdor',
    material: 'Material',
    batches: 'Partiyalar',
    images: 'Rasmlar',
    image: 'Rasm',
    url: 'Havola',
    batch: 'Partiya',
    batchId: 'Partiya ID',
    supplier: 'Yetkazib beruvchi',
    partner: 'Hamkor',
    phone: 'Telefon',
    address: 'Manzil',
    product: 'Mahsulot',
    productId: 'Mahsulot ID',
    productName: 'Mahsulot nomi',
    category: 'Kategoriya',
    description: 'Tavsif',
    stock: 'Zaxira',
    quantity: 'Miqdor',
    status: 'Holati',
    date: 'Sana',
    time: 'Vaqt',
    total: 'Jami',
    cost: 'Xarajat',
    weight: 'Ogirlik',
    unit: 'Birlik',
    user: 'Foydalanuvchi',
    email: 'Elektron pochta',
    note: 'Eslatma',
    comment: 'Izoh',
  };

  // Check if we have a direct translation
  if (translations[key]) {
    return translations[key];
  }

  // Fallback to original formatting
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/id$/i, 'ID')
    .replace(/^./, (char) => char.toUpperCase());
};

const renderPrimitive = (value: unknown) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (typeof value === 'boolean') {
    return value ? 'Ha' : 'Yoq';
  }

  if (typeof value === 'number') {
    return formatQuantity(value);
  }

  if (typeof value === 'string') {
    if (isIsoDate(value)) {
      return date(value);
    }

    if (/^https?:\/\//i.test(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-4"
        >
          {value}
        </a>
      );
    }

    return value.trim().length > 0 ? (
      value
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }

  return String(value);
};

const renderObject = (value: Record<string, unknown>, depth: number) => {
  if (depth > 3) {
    return (
      <pre className="bg-muted/40 rounded-md p-3 text-xs whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="grid gap-2">
      {entries.map(([key, nestedValue]) => (
        <div key={key} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            {formatLabel(key)}
          </span>
          <div className="rounded-md bg-background border border-border/40 px-3 py-2 text-sm">
            {renderValue(nestedValue, depth + 1)}
          </div>
        </div>
      ))}
    </div>
  );
};

const renderArray = (value: unknown[], depth: number) => {
  if (value.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (value.every((item) => isPrimitive(item))) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {renderPrimitive(item)}
          </Badge>
        ))}
      </div>
    );
  }

  if (value.every((item) => isPlainObject(item) && 'url' in item)) {
    const urls = value
      .map((item) => (item as Record<string, unknown>).url)
      .filter((url): url is string => typeof url === 'string');
    if (urls.length > 0) {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {urls.map((url, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-md border border-border/60 bg-background"
            >
              <img
                src={url}
                alt={`rasm-${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      );
    }
  }

  if (value.every((item) => isPlainObject(item))) {
    return (
      <div className="grid gap-3">
        {value.map((entry, index) => (
          <div
            key={index}
            className="rounded-md border border-border/60 bg-muted/20 px-3 py-2"
          >
            {renderObject(entry as Record<string, unknown>, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <pre className="bg-muted/40 rounded-md p-3 text-xs whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
};

const renderValue = (value: unknown, depth = 0): JSX.Element | string => {
  if (Array.isArray(value)) {
    return renderArray(value, depth);
  }

  if (isPlainObject(value)) {
    return renderObject(value, depth);
  }

  return renderPrimitive(value);
};

const extractImages = (item: Record<string, unknown>) => {
  if (!item) return [] as string[];

  const images: string[] = [];

  const maybeImages = item.images;
  if (Array.isArray(maybeImages)) {
    maybeImages.forEach((node) => {
      if (typeof node === 'string') {
        images.push(node);
      } else if (isPlainObject(node) && typeof node.url === 'string') {
        images.push(node.url);
      }
    });
  }

  if (typeof item.image === 'string') {
    images.push(item.image);
  }

  return Array.from(new Set(images));
};

export function ResourceDetailDialog({
  open,
  onClose,
  item,
  title = 'Batafsil malumot',
  description = 'Tanlangan yozuv boyicha toliq malumot',
}: ResourceDetailDialogProps) {
  const safeItem = useMemo(() => item ?? null, [item]);

  if (!safeItem) {
    return null;
  }

  const entries = Object.entries(safeItem);

  const primitiveEntries = entries.filter(([_, value]) => isPrimitive(value));
  const objectEntries = entries.filter(([key, value]) => {
    if (key === 'images' || key === 'image') return false;
    return isPlainObject(value);
  });
  const arrayEntries = entries.filter(([_, value]) => Array.isArray(value));

  const gallery = extractImages(safeItem);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="grid gap-6 py-4">
            {primitiveEntries.length > 0 && (
              <section className="grid gap-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Asosiy malumotlar
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {primitiveEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-md border border-border/40 bg-muted/10 px-3 py-2"
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatLabel(key)}
                      </span>
                      <div className="text-sm mt-1">
                        {renderPrimitive(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {gallery.length > 0 && (
              <section className="grid gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Rasmlar
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Jami: {gallery.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {gallery.map((url, index) => (
                    <div
                      key={url + index}
                      className="overflow-hidden rounded-lg border border-border/50 bg-background"
                    >
                      <img
                        src={url}
                        alt={`rasm-${index + 1}`}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {objectEntries.length > 0 && (
              <section className="grid gap-4">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Ichki obyektlar
                </h4>
                <div className="grid gap-4">
                  {objectEntries.map(([key, value]) => (
                    <div key={key} className="grid gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {formatLabel(key)}
                      </span>
                      <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-3">
                        {renderValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {arrayEntries.length > 0 && (
              <section className="grid gap-4">
                <Separator />
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Royxatlar
                </h4>
                <div className="grid gap-4">
                  {arrayEntries.map(([key, value]) => (
                    <div key={key} className="grid gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {formatLabel(key)}
                      </span>
                      <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-3">
                        {renderValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
