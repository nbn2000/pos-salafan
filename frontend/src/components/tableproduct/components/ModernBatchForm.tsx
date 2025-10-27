import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  DollarSign,
  TrendingUp,
  X,
  Save,
  Calculator,
} from 'lucide-react';
import { toast } from 'react-toastify';

const batchSchema = z.object({
  amount: z.coerce.number().positive("Miqdor musbat bo'lishi kerak"),
  cost: z.coerce.number().positive("Xarajat musbat bo'lishi kerak"),
  sellPrice: z.coerce.number().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface ModernBatchFormProps {
  product: ProductWithBatches;
  batch?: ProductBatch | null;
  onSubmit: (data: BatchFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ModernBatchForm({
  product,
  batch,
  onSubmit,
  onCancel,
  isLoading,
}: ModernBatchFormProps) {
  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      amount: batch?.amount || 1,
      cost: batch?.cost || 0,
      sellPrice: batch?.sellPrice || undefined,
    },
  });

  const watchedValues = form.watch();
  const profit =
    watchedValues.sellPrice && watchedValues.cost
      ? (watchedValues.sellPrice - watchedValues.cost) *
        (watchedValues.amount || 0)
      : 0;

  const profitPerUnit =
    watchedValues.sellPrice && watchedValues.cost
      ? watchedValues.sellPrice - watchedValues.cost
      : 0;

  const handleSubmit = async (data: BatchFormData) => {
    try {
      await onSubmit(data);
      toast.success(batch ? 'Partiya yangilandi' : 'Partiya yaratildi');
    } catch (error: any) {
      toast.error(error?.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {batch ? 'Partiyani tahrirlash' : 'Yangi partiya yaratish'}
          </h1>
          <p className="text-muted-foreground">
            {product.name} uchun partiya ma'lumotlari
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Bekor qilish
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mahsulot ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
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
                  <Package className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Jami:{' '}
                  {Number(product.totalBatchAmount || 0).toLocaleString(
                    'uz-UZ'
                  )}{' '}
                  dona
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Partiya tafsilotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Miqdor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  min="1"
                  {...form.register('amount')}
                  placeholder="0"
                  className="h-11"
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Xarajat (dona uchun) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('cost')}
                  placeholder="0.00"
                  className="h-11"
                />
                {form.formState.errors.cost && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.cost.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice">Sotuv narxi (dona uchun)</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                min="0"
                {...form.register('sellPrice')}
                placeholder="0.00 (ixtiyoriy)"
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

        {/* Calculations */}
        {watchedValues.amount && watchedValues.cost && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Hisob-kitoblar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {Number(
                      watchedValues.cost * (watchedValues.amount || 0)
                    ).toLocaleString('uz-UZ')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Jami xarajat (so'm)
                  </div>
                </div>

                {watchedValues.sellPrice && (
                  <>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">
                        {Number(
                          watchedValues.sellPrice * (watchedValues.amount || 0)
                        ).toLocaleString('uz-UZ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Jami daromad (so'm)
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg">
                      <div
                        className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {profit >= 0 ? '+' : ''}
                        {Number(profit).toLocaleString('uz-UZ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Jami foyda (so'm)
                      </div>
                    </div>
                  </>
                )}
              </div>

              {watchedValues.sellPrice && <Separator className="my-4" />}

              {watchedValues.sellPrice && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Dona uchun foyda
                    </span>
                  </div>
                  <div
                    className={`text-sm font-bold ${profitPerUnit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {profitPerUnit >= 0 ? '+' : ''}
                    {Number(profitPerUnit).toLocaleString('uz-UZ')} so'm
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
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
                {batch ? 'Yangilash' : 'Yaratish'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
