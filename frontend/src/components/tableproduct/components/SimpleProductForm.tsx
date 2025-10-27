import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, X, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const productSchema = z.object({
  name: z.string().min(1, 'Mahsulot nomi majburiy'),
  type: z.enum(['KG', 'UNIT'], { required_error: "O'lchov birligini tanlang" }),
  minAmount: z.coerce.number().min(0, "Minimal miqdor 0 dan kam bo'lmasin"),
  amount: z.coerce.number().positive("Miqdor musbat bo'lishi kerak"),
  sellPrice: z.coerce.number().optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface SimpleProductFormProps {
  product?: ProductWithBatches | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SimpleProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: SimpleProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      type: (product?.type as 'KG' | 'UNIT') || 'KG',
      minAmount: product?.minAmount || 5,
      amount: 1,
      sellPrice: null,
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      toast.success(product ? 'Mahsulot yangilandi' : 'Mahsulot yaratildi');
    } catch (error: any) {
      toast.error(error?.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot yaratish'}
          </h1>
          <p className="text-muted-foreground">
            Mahsulot ma'lumotlarini kiriting
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Bekor qilish
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Mahsulot ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Mahsulot nomi *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Masalan: Premium burger"
                className="h-11"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">O'lchov birligi *</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value: 'KG' | 'UNIT') => form.setValue('type', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="O'lchov birligini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">Kilogram (KG)</SelectItem>
                  <SelectItem value="UNIT">Dona (UNIT)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Minimal miqdor *</Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register('minAmount')}
                  placeholder="5"
                  className="h-11"
                />
                {form.formState.errors.minAmount && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.minAmount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Ishlab chiqarish miqdori *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...form.register('amount')}
                  placeholder="1"
                  className="h-11"
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice">Sotuv narxi (ixtiyoriy)</Label>
              <Input
                id="sellPrice"
                type="number"
                min="0"
                step="0.01"
                {...form.register('sellPrice')}
                placeholder="100000"
                className="h-11"
              />
              {form.formState.errors.sellPrice && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.sellPrice.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50">
          <Button type="button" variant="outline" onClick={onCancel}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-32">
            {isLoading ? (
              'Saqlanmoqda...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {product ? 'Yangilash' : 'Yaratish'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
