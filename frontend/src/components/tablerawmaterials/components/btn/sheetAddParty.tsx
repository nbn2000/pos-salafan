// components/raw-material/parties/SheetAddParty.tsx
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
import { useAddRawMaterialBatchMutation } from '@/api/raw-materials/raw-material-batches';
import { useAppSelector } from '@/store/hooks';
import { AddPartnerModal } from '@/components/common/AddPartnerModal';
import type { CreateRawMaterialBatchPayload, PaymentType } from '@/interfaces/raw-material/raw-materials';

// вњ… Yangi soddalashtirilgan schema
const AddPartySchema = z.object({
  amount: z.coerce.number().positive("Miqdor > 0 bo'lishi kerak"),
  buyPrice: z.coerce.number().min(0, "Manfiy bo'lmasin"),
  paid: z.coerce.number().min(0, "Manfiy bo'lmasin"),
  supplierId: z.string().uuid('Supplier tanlang'),
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
type AddPartyForm = z.infer<typeof AddPartySchema>;

const paymentTypeOptions = [
  { id: 'CASH', label: 'Naqd', value: 'CASH' },
  { id: 'CARD', label: 'Karta', value: 'CARD' },
  { id: 'TRANSFER', label: 'O\'tkazma', value: 'TRANSFER' },
];

export function SheetAddParty({
  open,
  onClose,
  rawMaterialId,
}: {
  open: boolean;
  onClose: () => void;
  rawMaterialId: string;
}) {
  const [createParty, { isLoading }] = useAddRawMaterialBatchMutation();

  const methods = useForm<AddPartyForm>({
    resolver: zodResolver(AddPartySchema),
    defaultValues: {
      amount: 0 as unknown as any,
      buyPrice: 0 as unknown as any,
      paid: 0 as unknown as any,
      supplierId: '' as any,
      paymentType: undefined,
    },
  });

  const {
    handleSubmit,
    reset,
    register,
    watch,
    formState: { errors },
    setValue,
  } = methods;


  // --- Supplier qidiruv (SearchSelect) ---
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  
  // Fetch all suppliers at once for local filtering
  const { data: partnersData } = useGetPartnersQuery({
    page: 1,
    take: 99999,  // Get all data at once
    // No search parameter - fetch all and filter locally
    searchField: 'name', // searchBy -> searchField
    sortField: 'name',
    sortOrder: 'ASC',
  });

  const supplierList: Partner[] = Array.isArray(partnersData)
    ? (partnersData as Partner[])
    : (partnersData?.results ?? []);

  const supplierOptions = supplierList.map((p) => ({
    id: p.id,
    label: p.name,
    value: p.id,
  }));

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

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

  const onSubmit = async (data: AddPartyForm) => {
    try {
      const payload: CreateRawMaterialBatchPayload = {
        amount: data.amount,
        buyPrice: data.buyPrice,
        paid: data.paid,
        supplierId: data.supplierId,
        paymentType: data.paymentType as PaymentType,
      };

      await createParty({ rawMaterialId, data: payload }).unwrap();
      toast.success("Partiya muvaffaqiyatli qo'shildi");
      onClose();
      reset();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? (
      <div className="col-start-2 col-span-3 text-xs text-red-500">{msg}</div>
    ) : null;

  // Values are already in UZS
  const buyUzs = Number(watch('buyPrice') || 0);
  const paidUzs = Number(watch('paid') || 0);

  return (
    <Sheet open={open}>
      <SheetContent className="w-[520px] sm:w-[520px]">
        <SheetHeader>
          <SheetTitle>Yangi partiya</SheetTitle>
          <SheetDescription>Homashyoga yangi partiya qoshish</SheetDescription>
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
                  id="buyPrice"
                  name="buyPrice"
                  control={methods.control}
                  decimalScale={4}
                  inputMode="decimal"
                  allowLeadingZeros={false}
                  placeholder="4"
                />
                <div className="text-[11px] text-muted-foreground">
                  {buyUzs.toLocaleString('uz-UZ')} so'm
                </div>
              </div>
              <ErrorText msg={errors.buyPrice?.message} />

              {/* Paid (USD) */}
              <Label htmlFor="paid" className="text-right">
                Tolov
              </Label>
              <div className="col-span-3 space-y-1">
                <CurrencyInput
                  id="paid"
                  name="paid"
                  control={methods.control}
                  decimalScale={4}
                  inputMode="decimal"
                  allowLeadingZeros={false}
                  placeholder="200"
                />
                <div className="text-[11px] text-muted-foreground">
                  {paidUzs.toLocaleString('uz-UZ')} so'm
                </div>
              </div>
              <ErrorText msg={errors.paid?.message} />

              {/* Payment Type - Only show if paid > 0 */}
              {watch('paid') > 0 && (
                <>
                  <Label className="text-right">To'lov turi</Label>
                  <div className="col-span-3">
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
                      <div className="text-xs text-red-500 mt-1">
                        {errors.paymentType.message}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Supplier (SearchSelect) */}
              <Label className="text-right">Yetkazib beruvchi</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ta'minotchi tanlang
                  </span>
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
                  <div className="text-xs text-red-500">
                    {errors.supplierId.message}
                  </div>
                )}
              </div>
            </div>

            <SheetFooter>
              <SheetClose asChild>
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
              </SheetClose>
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
