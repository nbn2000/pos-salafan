import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchSelect } from '@/components/ui/search-select';
import { Separator } from '@/components/ui/separator';
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddProductMutation } from '@/api/products';
import { toast } from 'react-toastify';

const ProductSchema = z.object({
  name: z.string().min(1, 'Mahsulot nomi majburiy'),
  type: z.enum(['KG', 'UNIT'], { required_error: "O'lchov birligini tanlang" }),
  priority: z.enum(['HIGH', 'LOW']).optional(),
  amount: z.coerce.number().positive("Miqdor musbat bo'lishi kerak"),
  cost: z.coerce
    .number()
    .min(0, "Tannarx 0 dan kam bo'lmasin")
    .optional()
    .nullable(),
  sellPrice: z.coerce
    .number()
    .min(0, "Sotuv narxi 0 dan kam bo'lmasin")
    .optional()
    .nullable(),
});

type ProductForm = z.infer<typeof ProductSchema>;

const typeOptions = [
  { id: 'KG', label: 'KG', value: 'KG' },
  { id: 'UNIT', label: 'DONA', value: 'UNIT' },
];

const priorityOptions = [
  { id: 'HIGH', label: 'Baland', value: 'HIGH' },
  { id: 'LOW', label: 'Past', value: 'LOW' },
];

// AddButtonComponent to render a button for adding a new item
function AddButtonComponent(): React.ReactNode {
  const [addOpen, setAddOpen] = useState(false);
  const [addProduct, { isLoading }] = useAddProductMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      type: 'KG',
      priority: 'LOW',
      amount: 1,
      cost: null,
      sellPrice: null,
    },
  });

  // Close the add sheet
  const handleAddClose = () => {
    setAddOpen(false);
    reset();
  };

  // Open the add sheet
  const handleAddClick = () => {
    setAddOpen(true);
  };

  // Handle form submission
  const onSubmit = async (form: ProductForm) => {
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        priority: form.priority,
        amount: Number(form.amount),
        // Send undefined for optional fields when empty; 0 should be preserved
        cost:
          form.cost === null || form.cost === undefined || form.cost === ('' as any)
            ? undefined
            : Number(form.cost),
        sellPrice:
          form.sellPrice === null ||
          form.sellPrice === undefined ||
          form.sellPrice === ('' as any)
            ? undefined
            : Number(form.sellPrice),
      } as Partial<CreateProductPayload> as CreateProductPayload;

      await addProduct(payload).unwrap();
      toast.success('Mahsulot muvaffaqiyatli yaratildi');
      reset();
      setAddOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.data?.message || 'Mahsulot yaratishda xatolik yuz berdi'
      );
    }
  };

  return (
    <>
      {/* Enhanced Button for adding a new item */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg gap-2 h-10 px-4"
            >
              <Plus className="h-4 w-4" />
              Mahsulot qo'shish
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Yangi mahsulot qo'shish</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Add Product Sheet */}
      <Sheet open={addOpen}>
        <SheetContent className="w-[400px] sm:w-[640px] bg-background/95 backdrop-blur-sm border-l border-border/50">
          <SheetHeader className="space-y-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold">
                  Yangi mahsulot qo'shish
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Iltimos, mahsulot ma'lumotlarini kiriting
                </SheetDescription>
              </div>
            </div>
            <div
              onClick={handleAddClose}
              className="absolute right-4 top-4 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            >
              <Cross2Icon className="h-4 w-4" />
            </div>
          </SheetHeader>

          <Separator className="mb-6" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Mahsulot nomi</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Masalan: Non"
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
                    setValue('priority', val as 'HIGH' | 'LOW', {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Tanlang"
                  options={priorityOptions}
                />
                {errors.priority && (
                  <p className="text-xs text-red-500">
                    {errors.priority.message}
                  </p>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Miqdor</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                min="0.001"
                {...register('amount')}
                placeholder="1"
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost">Tannarx</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('cost')}
                  placeholder="0"
                />
                {errors.cost && (
                  <p className="text-xs text-red-500">{errors.cost.message}</p>
                )}
              </div>

              {/* Sell Price */}
              <div className="space-y-2">
                <Label htmlFor="sellPrice">Sotuv narxi</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('sellPrice')}
                  placeholder="0"
                />
                {errors.sellPrice && (
                  <p className="text-xs text-red-500">
                    {errors.sellPrice.message}
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <SheetFooter className="flex gap-3">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddClose}
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
                    <Package className="mr-2 h-4 w-4" />
                    Qo'shish
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AddButtonComponent;
