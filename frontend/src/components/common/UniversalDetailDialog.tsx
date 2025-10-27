import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { date, formatPhoneNumber, formatQuantity } from '@/lib/utils';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  Package,
  Calendar,
  User,
  Hash,
  Tag,
  Box,
  DollarSign,
} from 'lucide-react';

interface UniversalDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: any | null;
  title?: string;
  description?: string;
  fields?: DetailField[];
  showImage?: boolean;
  imageField?: string;
  imageAltField?: string;
  showBatches?: boolean;
  batchField?: string;
  emptyMessage?: string;
}

interface DetailField {
  key: string;
  label: string;
  icon?: React.ReactNode;
  render?: (value: any, item: any) => React.ReactNode;
  type?: 'text' | 'date' | 'phone' | 'price' | 'quantity' | 'badge';
}

const Group = ({
  name,
  value,
  icon,
}: {
  name: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex gap-2 items-center">
    {icon && <div className="text-muted-foreground">{icon}</div>}
    <span className="font-medium text-muted-foreground whitespace-nowrap">
      {name}
    </span>
    <p className="truncate">{value}</p>
  </div>
);

const defaultFields: DetailField[] = [
  {
    key: 'name',
    label: 'Nomi:',
    icon: <Package className="h-4 w-4" />,
  },
  {
    key: 'sku',
    label: 'SKU:',
    icon: <Hash className="h-4 w-4" />,
  },
  {
    key: 'product_type',
    label: 'Turi:',
    icon: <Tag className="h-4 w-4" />,
    render: (value) => (value === 'PIECE' ? 'Dona' : 'KG'),
  },
  {
    key: 'supplier.full_name',
    label: 'Yetkazuvchi:',
    icon: <User className="h-4 w-4" />,
    render: (value) => value || 'Tanlanmagan',
  },
  {
    key: 'supplier.phone_number',
    label: 'Yetkazuvchi telefoni:',
    icon: <User className="h-4 w-4" />,
    type: 'phone',
    render: (value) => formatPhoneNumber(value) || 'Tanlanmagan',
  },
  {
    key: 'created_at',
    label: 'Yaratilgan Sana:',
    icon: <Calendar className="h-4 w-4" />,
    type: 'date',
  },
  {
    key: 'updated_at',
    label: "O'zgartirilgan Sana:",
    icon: <Calendar className="h-4 w-4" />,
    type: 'date',
  },
];

export function UniversalDetailDialog({
  open,
  onClose,
  item,
  title = "Ma'lumot haqida",
  description = "Tanlangan element haqida batafsil ma'lumot",
  fields = defaultFields,
  showImage = true,
  imageField = 'image',
  imageAltField = 'name',
  showBatches = true,
  batchField = 'product_batches',
  emptyMessage = "Ma'lumot topilmadi",
}: UniversalDetailDialogProps) {
  if (!item) return null;

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const renderFieldValue = (field: DetailField, value: any) => {
    if (field.render) {
      return field.render(value, item);
    }

    switch (field.type) {
      case 'date':
        return date(value);
      case 'phone':
        return formatPhoneNumber(value) || 'Tanlanmagan';
      case 'price':
        return `${formatQuantity(value)} so'm`;
      case 'quantity':
        return formatQuantity(value) || '-';
      case 'badge':
        return value === 'PIECE' ? 'Dona' : 'KG';
      default:
        return value || 'Tanlanmagan';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-border/50">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full pr-2">
            <div className="grid gap-4 text-sm pt-4">
              {/* Main Info */}
              <div className="flex items-center flex-col-reverse sm:flex-row gap-4">
                <div className="grid grid-cols-1 gap-3">
                  {fields.map((field) => {
                    const value = getNestedValue(item, field.key);
                    return (
                      <Group
                        key={field.key}
                        name={field.label}
                        value={renderFieldValue(field, value)}
                        icon={field.icon}
                      />
                    );
                  })}
                </div>

                {showImage && item[imageField] && (
                  <div className="max-w-[300px] w-full h-full max-h-[250px] overflow-hidden flex justify-center">
                    <img
                      className="h-full w-auto"
                      width={500}
                      height={500}
                      src={item[imageField]}
                      alt={item[imageAltField] || 'Image'}
                    />
                  </div>
                )}
              </div>

              {/* Batches Section */}
              {showBatches &&
                item[batchField] &&
                item[batchField].length > 0 && (
                  <div>
                    <Separator className="my-4" />
                    <h4 className="mb-2 text-base font-semibold">Partiyalar</h4>
                    <div className="space-y-2 mt-4">
                      {item[batchField].map((batch: any, index: number) => (
                        <div
                          key={batch.id || batch.created_at || index}
                          className="border rounded-lg p-3 flex justify-between items-start text-sm"
                        >
                          <div className="flex flex-col gap-3">
                            <p className="font-medium">
                              Miqdori: {batch.quantity}{' '}
                              {item.product_type === 'PIECE' ? 'Dona' : 'KG'}
                            </p>
                            <p>
                              Olingan Narx: {formatQuantity(batch.buy_price)}{' '}
                              so'm
                            </p>
                            <p>
                              Sotish Narxi: {formatQuantity(batch.sell_price)}{' '}
                              so'm
                            </p>
                          </div>
                          <p className="text-muted-foreground text-xs whitespace-nowrap">
                            {date(batch.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Empty State */}
              {!item ||
                (Object.keys(item).length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{emptyMessage}</p>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
