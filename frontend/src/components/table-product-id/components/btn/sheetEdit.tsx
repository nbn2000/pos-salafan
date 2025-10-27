// components/products/SheetEditProductBatch.tsx
import { useUpdateProductBatchMutation } from '@/api/products/product-batch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';
import { DollarSign } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks';
import { z } from 'zod';

const batchEditSchema = z.object({
  amount: z.string().min(1, 'Miqdor kiriting'),
  sell_price_uzs: z.string().min(1, 'Bir dona sotuv narxi kiriting'),
});

type BatchEditForm = z.infer<typeof batchEditSchema>;

// "12 345" -> 12345
const toNum = (v: string | number | null | undefined) =>
  Number(
    String(v ?? '')
      .split(' ')
      .join('')
  ) || 0;

export function SheetEdit({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductBatch | null;
}) {
  const [updateProductBatch] = useUpdateProductBatchMutation();

  const methods = useForm<BatchEditForm>({
    resolver: zodResolver(batchEditSchema),
    defaultValues: {
      amount: '',
      sell_price_uzs: '',
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = methods;


  // Formni mavjud batch qiymatlari bilan to'ldirish
  useEffect(() => {
    if (open && product) {
      reset({
        amount: String(product.amount ?? ''),
        sell_price_uzs: String((product as any).sellPriceUzs ?? ''),
      });
    }
  }, [open, product, reset]);

  const sellUzs = toNum(watch('sell_price_uzs'));


  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: BatchEditForm) => {
    if (!product?.id) return;

    const next = {
      amount: toNum(data.amount),
      sellPriceUzs: toNum(data.sell_price_uzs), // per-unit UZS
    };

    const prev = {
      amount: product.amount,
      sellPriceUzs: (product as any).sellPriceUzs,
    };

    const unchanged =
      next.amount === prev.amount &&
      next.sellPriceUzs === prev.sellPriceUzs;

    if (unchanged) {
      toast.info('OвЂzgarishlar kiritilmadi');
      onClose();
      return;
    }

    try {
      await updateProductBatch({ id: product.id, data: next }).unwrap();
      toast.success("Partiya o'zgartirildi");
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi, iltimos qayta urinib ko'ring");
    }
  };

  return (
    <Sheet open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Partiyani oвЂzgartirish</SheetTitle>
          <SheetDescription>
            Partiya maвЂ™lumotlarini tahrirlang
          </SheetDescription>
          <div
            onClick={handleCancel}
            className="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 hover:opacity-100"
          >
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </div>
        </SheetHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              {/* Amount */}
              <Label htmlFor="amount" className="text-right">
                Miqdor
              </Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    {...field}
                    id="amount"
                    thousandSeparator=" "
                    decimalScale={0}
                    allowNegative={false}
                    getInputRef={field.ref}
                    className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    onValueChange={(values) => field.onChange(values.value)}
                    value={field.value}
                  />
                )}
              />
              {errors.amount && (
                <div className="col-start-2 col-span-3 text-red-500 text-xs">
                  {errors.amount.message}
                </div>
              )}

              {/* Sell price (per-unit, UZS) */}
              <Label htmlFor="sell_price_uzs" className="text-right">
                Bir dona sotuv narxi (UZS)
              </Label>
              <Controller
                name="sell_price_uzs"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    {...field}
                    id="sell_price_uzz"
                    thousandSeparator=" "
                    decimalScale={0}
                    allowNegative={false}
                    getInputRef={field.ref}
                    className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    onValueChange={(values) => field.onChange(values.value)}
                    value={field.value}
                  />
                )}
              />
              {errors.sell_price_uzs && (
                <div className="col-start-2 col-span-3 text-red-500 text-xs">
                  {errors.sell_price_uzs.message}
                </div>
              )}

            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Iltimos kuting...
                    </>
                  ) : (
                    "O'zgartirish"
                  )}
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
