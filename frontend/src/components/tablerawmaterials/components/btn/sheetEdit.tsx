// components/tablerawmaterials/components/btn/sheetEdit.tsx
import { Button } from '@/components/ui/button';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';
import { Box, Edit, Save } from 'lucide-react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { useUpdateRawMaterialsMutation } from '@/api/raw-materials';
import type {
  MaterialSummary,
  MeasureType,
  Priority,
} from '@/interfaces/raw-material/raw-materials';

const EditSchema = z.object({
  name: z.string().min(1, 'Xomashyo nomi majburiy'),
  type: z.enum(['KG', 'UNIT'], {
    required_error: "O'lchov (type) majburiy",
  }),
  priority: z.enum(['HIGH', 'LOW']).optional(),
});

type EditForm = z.infer<typeof EditSchema>;

const typeOptions = [
  { id: 'KG', label: 'KG', value: 'KG' },
  { id: 'UNIT', label: 'DONA', value: 'UNIT' },
];

const priorityOptions = [
  { id: 'LOW', label: 'Past', value: 'LOW' },
  { id: 'HIGH', label: 'Yuqori', value: 'HIGH' },
];

export function SheetEdit({
  open,
  onClose,
  material,
}: {
  open: boolean;
  onClose: () => void;
  material: MaterialSummary;
}) {
  const [updateRawMaterial, { isLoading }] = useUpdateRawMaterialsMutation();

  const methods = useForm<EditForm>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      name: '',
      type: 'KG',
      priority: 'LOW',
    },
  });

  const { register, handleSubmit, reset, watch, setValue, formState } = methods;
  const { errors } = formState;

  // Prefill when opened
  useEffect(() => {
    if (open && material) {
      reset({
        name: material.name ?? '',
        type: (material.type as MeasureType) ?? 'KG',
        priority: (material.priority as Priority) ?? 'LOW',
      });
    }
  }, [open, material, reset]);

  const onSubmit = async (formData: EditForm) => {
    if (!material?.id) {
      toast.error('Xomashyo ID topilmadi');
      return;
    }
    try {
      await updateRawMaterial({
        id: material.id,
        data: {
          name: formData.name.trim(),
          type: formData.type,
          priority: formData.priority,
        },
      }).unwrap();

      toast.success('Xomashyo muvaffaqiyatli yangilandi');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi, yana urinib ko'ring");
    }
  };

  return (
    <Sheet open={open}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background/95 backdrop-blur-sm border-l border-border/50">
        <SheetHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">
                Xomashyoni tahrirlash
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Nomi, o'lchovi va muhimlik darajasi yangilanadi
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
            <span className="sr-only">Yopish</span>
          </div>
        </SheetHeader>

        <Separator className="mb-6" />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-primary" />
                <Label htmlFor="name" className="text-sm font-medium">
                  Xomashyo nomi
                </Label>
              </div>
              <Input
                id="name"
                {...register('name')}
                className="h-11 bg-background/80 border-border/50 focus:border-primary/50"
                placeholder="Masalan: Paxta"
              />
              {errors.name && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </div>
              )}
            </div>

            {/* Type (MeasurementType) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                O‘lchov (type)
              </Label>
              <SearchSelect
                value={watch('type')}
                onValueChange={(val) =>
                  setValue('type', val as EditForm['type'], {
                    shouldValidate: true,
                  })
                }
                placeholder="Tanlang"
                options={typeOptions}
              />
              {errors.type && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.type.message}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Muhimlik darajasi
              </Label>
              <SearchSelect
                value={watch('priority') || 'LOW'}
                onValueChange={(val) =>
                  setValue('priority', val as EditForm['priority'], {
                    shouldValidate: true,
                  })
                }
                placeholder="Tanlang"
                options={priorityOptions}
              />
              {errors.priority && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.priority.message}
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
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Saqlash
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
