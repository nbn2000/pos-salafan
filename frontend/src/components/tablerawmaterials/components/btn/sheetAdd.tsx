// components/raw-materials/SheetAddRawMaterial.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';
import { Plus } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/hook-form/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchSelect } from '@/components/ui/search-select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useGetPartnersQuery } from '@/api/partners'; // assuming this returns suppliers list
import { useAddRawMaterialsMutation } from '@/api/raw-materials';
import { useAppSelector } from '@/store/hooks';
import { AddPartnerModal } from '@/components/common/AddPartnerModal';

import type {
  CreateMaterialWithBatch,
  MeasureType,
  PaymentType,
  Priority,
} from '@/interfaces/raw-material/raw-materials';

type IdLike = string | number;
interface SupplierLike {
  id: IdLike;
  name?: string | null;
  full_name?: string | null;
  title?: string | null;
  phone_number?: string | null;
}

const RawMaterialSchema = z.object({
  name: z.string().min(1, 'Nomi majburiy'),
  type: z.enum(['KG', 'UNIT']),
  priority: z.enum(['HIGH', 'LOW']).optional(),
  supplierId: z.string().uuid("Ta'minotchi (supplier) tanlang"),

  amount: z.coerce.number().positive("Miqdor > 0 bo'lishi kerak"),
  buyPrice: z.coerce.number().positive("Sotib olish narxi > 0 bo'lishi kerak"),
  paid: z.coerce.number().min(0).default(0),
  paymentType: z.enum(['CASH', 'CARD', 'TRANSFER']).optional(),
}).refine((data) => {
  // If paid > 0, paymentType is required
  if (data.paid > 0 && !data.paymentType) {
    return false;
  }
  return true;
}, {
  message: "To'lov turi talab qilinadi (paid > 0)",
  path: ['paymentType'],
});
type RawMaterialForm = z.infer<typeof RawMaterialSchema>;

const typeOptions = [
  { id: 'KG', label: 'KG', value: 'KG' },
  { id: 'UNIT', label: 'DONA', value: 'UNIT' },
];

const paymentTypeOptions = [
  { id: 'CASH', label: 'Naqd', value: 'CASH' },
  { id: 'CARD', label: 'Karta', value: 'CARD' },
  { id: 'TRANSFER', label: 'O\'tkazma', value: 'TRANSFER' },
];

const priorityOptions = [
  { id: 'HIGH', label: 'Baland', value: 'HIGH' },
  { id: 'LOW', label: 'Past', value: 'LOW' },
];

function toSupplierOptions(raw: PartnersListResponse | undefined) {
  if (!raw) return [];
  const arr: SupplierLike[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.results)
      ? (raw.results as SupplierLike[])
      : [];

  return arr.map((p) => {
    const label = p.name ?? p.full_name ?? p.title ?? String(p.id);
    return {
      id: String(p.id),
      label,
      value: String(p.id),
    };
  });
}

export function SheetAdd({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const methods = useForm<RawMaterialForm>({
    resolver: zodResolver(RawMaterialSchema),
    defaultValues: {
      name: '',
      type: 'KG',
      priority: 'LOW',
      supplierId: '',
      amount: 0,
      buyPrice: 0,
      paid: 0,
      paymentType: undefined,
    },
  });


  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = methods;

  const [supplierSearch, setSupplierSearch] = useState('');
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);

  // Fetch all partners at once for local filtering
  const { data: partnersData, isFetching: partnersLoading } = useGetPartnersQuery({
    page: 1,
    take: 99999,  // Get all data at once
    // No search parameter - fetch all and filter locally
    sortField: 'name',
    sortOrder: 'ASC',
  });

  const supplierOptions = useMemo(
    () => toSupplierOptions(partnersData),
    [partnersData]
  );

  const [addRawMaterial, { isLoading }] = useAddRawMaterialsMutation();

  // Auto-calculate paid field when amount and buyPrice change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'amount' || name === 'buyPrice') {
        const amount = Number(value.amount || 0);
        const buyPrice = Number(value.buyPrice || 0);

        if (amount > 0 && buyPrice > 0) {
          const calculatedPaid = amount * buyPrice;
          setValue('paid', calculatedPaid, { shouldValidate: false });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const onSubmit = async (form: RawMaterialForm) => {
    try {
      const batch = {
        amount: Number(form.amount),
        buyPrice: Number(form.buyPrice),
      };

      const payload: CreateMaterialWithBatch = {
        name: form.name.trim(),
        type: form.type as MeasureType,
        priority: form.priority as Priority,
        supplierId: form.supplierId,
        batch,
        paid: Number(form.paid ?? 0),
        paymentType: form.paymentType as PaymentType,
      };

      // Debug: Check what priority value we're sending
      console.log('🐛 Form priority value:', form.priority);
      console.log('🐛 Full payload:', payload);

      const total = batch.amount * batch.buyPrice;
      if ((payload.paid ?? 0) > total) {
        toast.error("To'langan summa umumiy xarajatdan oshib ketgan.");
        return;
      }

      await addRawMaterial({ data: payload }).unwrap();
      toast.success("Xomashyo qo'shildi");
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  return (
    <Sheet open={open}>
      <SheetContent className="w-[400px] sm:w-[640px] bg-background/95 backdrop-blur-sm border-l border-border/50">
        <SheetHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">
                Yangi xomashyo qo'shish
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Iltimos, xomashyo ma'lumotlarini kiriting
              </SheetDescription>
            </div>
          </div>
          <div
            onClick={() => {
              onClose();
              reset();
            }}
            className="absolute right-4 top-4 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
          >
            <Cross2Icon className="h-4 w-4" />
          </div>
        </SheetHeader>

        <Separator className="mb-6" />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Xomashyo nomi</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Masalan: Paxta"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  O'lchov
                </Label>
                <SearchSelect
                  value={watch('type')}
                  onValueChange={(val: string | 'KG' | 'UNIT') =>
                    setValue('type', val as 'KG' | 'UNIT', {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Tanlang"
                  options={typeOptions}
                />
                {errors.type && (
                  <p className="text-xs text-red-500">{errors.type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Muhimlik darajasi
                </Label>
                <SearchSelect
                  value={watch('priority')}
                  onValueChange={(val: string) =>
                    setValue('priority', val as Priority, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Tanlang"
                  options={priorityOptions}
                />
                {errors.priority && (
                  <p className="text-xs text-red-500">{errors.priority.message}</p>
                )}
              </div>
            </div>


            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">
                  Ta'minotchi
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPartnerModal(true)}
                  className="h-8 w-8 p-0 border-dashed border-primary/50 hover:border-primary hover:bg-primary/10"
                  title="Yangi hamkor qo'shish"
                >
                  <Plus className="h-4 w-4 text-primary" />
                </Button>
              </div>
              <SearchSelect
                value={watch('supplierId')}
                placeholder="Ta'minotchini qidirish"
                searchPlaceholder="Ta'minotchi nomi..."
                options={supplierOptions}
                loading={partnersLoading}
                enableLocalFilter={true}  // Enable local filtering to minimize re-renders
                onValueChange={(val) =>
                  setValue('supplierId', val as string, {
                    shouldValidate: true,
                  })
                }
                onSearchChange={(val: string) => setSupplierSearch(val)}
              />
              {errors.supplierId && (
                <p className="text-xs text-red-500">
                  {errors.supplierId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2  gap-3">
              <div>
                <Label>Miqdor </Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  {...register('amount')}
                />
                {errors.amount && (
                  <p className="text-xs text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Sotib olish narxi </Label>
                <CurrencyInput
                  name="buyPrice"
                  control={control}
                  decimalScale={4}
                  className="h-10"
                  allowLeadingZeros={false}
                  inputMode="decimal"
                />
                {errors.buyPrice && (
                  <p className="text-xs text-red-500">
                    {errors.buyPrice.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>To'lov </Label>
                <CurrencyInput
                  name="paid"
                  control={control}
                  decimalScale={4}
                  className="h-10"
                  allowLeadingZeros={false}
                  inputMode="decimal"
                />
                {errors.paid && (
                  <p className="text-xs text-red-500">{errors.paid.message}</p>
                )}
              </div>
              
              {/* Payment Type - Only show if paid > 0 */}
              {watch('paid') > 0 && (
                <div>
                  <Label>To'lov turi</Label>
                  <SearchSelect
                    value={watch('paymentType') || ''}
                    onValueChange={(val: string) =>
                      setValue('paymentType', val as PaymentType, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="Tanlang"
                    options={paymentTypeOptions}
                  />
                  {errors.paymentType && (
                    <p className="text-xs text-red-500">
                      {errors.paymentType.message}
                    </p>
                  )}
                </div>
              )}
            </div>


            <Separator className="my-6" />

            <SheetFooter className="flex gap-3">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Qo'shilmoqda...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Qo'shish
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>

      {/* Add Partner Modal */}
      <AddPartnerModal
        open={showAddPartnerModal}
        onClose={() => setShowAddPartnerModal(false)}
        onPartnerAdded={(newPartner) => {
          // Refresh the partners query to include the new partner
          // The SearchSelect will automatically show the updated list
          setSupplierSearch(''); // Reset search to show all partners
          // Optionally, auto-select the newly created partner
          if (newPartner?.id) {
            setValue('supplierId', newPartner.id, {
              shouldValidate: true,
            });
          }
        }}
      />
    </Sheet>
  );
}
