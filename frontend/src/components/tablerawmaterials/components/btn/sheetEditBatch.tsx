// components/raw-material/parties/SheetEditBatch.tsx
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/hook-form/currency-input';
import { Input } from '@/components/ui/input';
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
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetPartnersQuery } from '@/api/partners';
import { SearchSelect } from '@/components/ui/search-select';
import { useUpdateRawMaterialBatchMutation } from '@/api/raw-materials/raw-material-batches';
import { useAppSelector } from '@/store/hooks';
import { AddPartnerModal } from '@/components/common/AddPartnerModal';

// ✅ Correct schema matching backend and sheetAddParty.tsx
const EditBatchSchema = z.object({
  amount: z.coerce.number().min(0, "Miqdor manfiy bo'lmasin"),
  buyPrice: z.coerce.number().min(0, "Manfiy bo'lmasin"),
  paid: z.coerce.number().min(0, "Manfiy bo'lmasin"),
  supplierId: z.string().uuid('Supplier tanlang'),
});

type EditBatchForm = z.infer<typeof EditBatchSchema>;

interface Partner {
  id: string;
  name: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  rawMaterialId: string;
  batch?: {
    id: string;
    amount: number;
    buyPrice: number;
    paid?: number;
  };
};

function ErrorText({ msg }: { msg?: string }) {
  return msg ? <div className="text-xs text-red-500 mt-1">{msg}</div> : null;
}

export function SheetEditBatch({ open, onClose, rawMaterialId, batch }: Props) {
  const methods = useForm<EditBatchForm>({
    resolver: zodResolver(EditBatchSchema),
    defaultValues: {
      amount: batch?.amount || 0,
      buyPrice: batch?.buyPrice || 0,
      paid: batch?.paid || 0,
      supplierId: '',
    },
  });

  const {
    register,
    watch,
    formState: { errors },
    setValue,
    handleSubmit,
    reset,
  } = methods;


  // --- Supplier search (SearchSelect) ---
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  
  // Fetch all suppliers at once for local filtering
  const { data: partnersData } = useGetPartnersQuery({
    page: 1,
    take: 99999,  // Get all data at once
    // No search parameter - fetch all and filter locally
    searchField: 'name',
    sortField: 'name',
    sortOrder: 'ASC',
  });

  const supplierList: Partner[] = Array.isArray(partnersData)
    ? partnersData
    : Array.isArray(partnersData?.results)
      ? partnersData.results
      : [];

  const supplierOptions = supplierList.map((p) => ({
    id: p.id,
    label: p.name,
    value: p.id,
  }));

  const [updateBatch, { isLoading }] = useUpdateRawMaterialBatchMutation();

  useEffect(() => {
    if (open && batch) {
      reset({
        amount: batch.amount || 0,
        buyPrice: batch.buyPrice || 0,
        paid: batch.paid || 0,
        supplierId: '',
      });
    }
  }, [open, reset, batch]);

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

  const onSubmit = async (data: EditBatchForm) => {
    if (!batch?.id) return;

    try {
      const payload: CreateMaterialBatch = {
        amount: data.amount,
        buyPrice: data.buyPrice,
        paid: data.paid,
        supplierId: data.supplierId as unknown as UUID,
      };

      await updateBatch({
        id: batch.id,
        rawMaterialId,
        data: payload,
      }).unwrap();

      toast.success('Partiya yangilandi');
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.";
      toast.error(msg);
    }
  };

  // Values are already in UZS
  const buyUzs = watch('buyPrice') || 0;
  const paidUzs = watch('paid') || 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[520px] sm:w-[520px]">
        <SheetHeader>
          <SheetTitle>Partiyani tahrirlash</SheetTitle>
          <SheetDescription>Partiya ma'lumotlarini yangilash</SheetDescription>
          <div
            onClick={() => {
              onClose();
              reset();
            }}
            className="absolute right-4 top-4 cursor-pointer opacity-70 hover:opacity-100"
          >
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Yopish</span>
          </div>
        </SheetHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              {/* Amount */}
              <Label htmlFor="amount" className="text-right">
                Miqdor
              </Label>
              <Input
                id="amount"
                inputMode="decimal"
                {...register('amount')}
                className="col-span-3"
                placeholder="100"
              />
              <ErrorText msg={errors.amount?.message} />


              {/* Buy price (USD) */}
              <Label htmlFor="buyPrice" className="text-right">
                Xarid narxi
              </Label>
              <div className="col-span-3 space-y-1">
                <CurrencyInput
                  name="buyPrice"
                  control={methods.control}
                  decimalScale={4}
                  className="h-10"
                  allowLeadingZeros={false}
                  placeholder="4"
                />
                <div className="text-[11px] text-muted-foreground">
                  ${' '}
                  {buyUzs.toLocaleString('uz-UZ', {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}
                </div>
              </div>
              <ErrorText msg={errors.buyPrice?.message} />

              {/* Paid (USD) */}
              <Label htmlFor="paid" className="text-right">
                Tolov
              </Label>
              <div className="col-span-3 space-y-1">
                <CurrencyInput
                  name="paid"
                  control={methods.control}
                  decimalScale={4}
                  className="h-10"
                  allowLeadingZeros={false}
                  placeholder="200"
                />
                <div className="text-[11px] text-muted-foreground">
                  $
                  {paidUzs.toLocaleString('en-US', {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}
                </div>
              </div>
              <ErrorText msg={errors.paid?.message} />

              {/* Supplier (SearchSelect) */}
              <div className="flex items-center justify-end gap-2">
                <Label>Yetkazib beruvchi</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPartnerModal(true)}
                  className="h-6 w-6 p-0 border-dashed border-primary/50 hover:border-primary hover:bg-primary/10"
                  title="Yangi hamkor qo'shish"
                >
                  <Plus className="h-3 w-3 text-primary" />
                </Button>
              </div>
              <div className="col-span-3">
                <SearchSelect
                  value={watch('supplierId')}
                  placeholder="Yetkazib beruvchini qidirish..."
                  searchPlaceholder="Yetkazib beruvchi nomi..."
                  options={supplierOptions}
                  enableLocalFilter={true}  // Enable local filtering to minimize re-renders
                  onValueChange={(val) =>
                    setValue('supplierId', val as string, {
                      shouldValidate: true,
                    })
                  }
                  onSearchChange={(val: string) => setSupplierSearch(val)}
                />
                {errors.supplierId && (
                  <div className="text-xs text-red-500 mt-1">
                    {errors.supplierId.message}
                  </div>
                )}
              </div>
            </div>

            <SheetFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="text-gray-100"
              >
                {isLoading ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  'Saqlash'
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
          // Reset search to show all partners
          setSupplierSearch('');
          // Auto-select the newly created partner
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
