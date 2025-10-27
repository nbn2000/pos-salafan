// components/partners/SheetEdit.tsx
import { Button } from '@/components/ui/button';
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
import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { Phone } from '@/components/hook-form/phone';
import {
  User,
  Phone as PhoneIcon,
  Edit,
  DollarSign,
  Scale,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { NumericFormat } from 'react-number-format';
import { useUpdatePartnersMutation } from '@/api/partners';

// --- Typelar (sizdagiga mos) ---
type Partner = {
  id: string;
  name: string;
  phone: string; // "+99890..."
  address: string;
  description: string;
  credit: number; // >= 0
  debt: number; // >= 0
  createdAt: string;
  updatedAt: string;
};

type UpdatePartnerPayload = Partial<{
  name: string;
  phone: string; // "+998..."
  address: string;
  description: string;
  credit: number;
  debt: number;
}>;

// --- Validatsiya ---
const EditSchema = z.object({
  name: z.string().min(1, 'Ism majburiy'),
  phone: z.string().regex(/^\d{9}$/, "Telefon raqam 9 raqamdan bo'lishi kerak"),
});

type EditForm = z.infer<typeof EditSchema>;

export function SheetEdit({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: Partner | null;
}) {
  const methods = useForm<EditForm>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = methods;

  const [updatePartner] = useUpdatePartnersMutation();

  // Dastlabki qiymatlar
  useEffect(() => {
    if (open && data) {
      const cleanedPhone = data.phone?.replace(/^\+998/, '') || '';
      reset({
        name: data.name ?? '',
        phone: cleanedPhone,
      });
    }
  }, [open, data, reset]);

  // Snapshot (faqat o'zgarganlarini yuborish uchun)
  const initialSnapshot = useMemo(() => {
    if (!data) return null;
    return {
      name: data.name ?? '',
      phone: (data.phone ?? '').replace(/^\+998/, ''),
      address: data.address ?? '',
      description: data.description ?? '',
      credit: Number(data.credit ?? 0),
      debt: Number(data.debt ?? 0),
    };
  }, [data]);

  const buildPatch = (cur: EditForm): UpdatePartnerPayload => {
    const patch: UpdatePartnerPayload = {};
    if (!initialSnapshot) return patch;

    if (cur.name !== initialSnapshot.name) patch.name = cur.name;
    if (cur.phone !== initialSnapshot.phone) patch.phone = `+998${cur.phone}`;

    return patch;
  };

  const onSubmit = async (formData: EditForm) => {
    if (!data?.id) {
      toast.error('Hamkor ID topilmadi');
      return;
    }

    const patch = buildPatch(formData);
    if (Object.keys(patch).length === 0) {
      toast.info("O'zgarishlar kiritilmadi");
      onClose();
      return;
    }

    try {
      await updatePartner({ id: data.id, data: patch }).unwrap();
      toast.success('Hamkor ma’lumotlari yangilandi');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || "Xatolik yuz berdi, yana urinib ko'ring"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] sm:w-[560px] bg-background/95 backdrop-blur-sm border-l border-border/50">
        <SheetHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">
                Hamkorni tahrirlash
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Ism, telefon, manzil, ta’rif va qarzdorliklarni yangilang
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
                <User className="h-4 w-4 text-primary" />
                <Label htmlFor="name" className="text-sm font-medium">
                  To'liq ism
                </Label>
              </div>
              <Input
                id="name"
                {...register('name')}
                className="h-11 bg-background/80 border-border/50 focus:border-primary/50"
                placeholder="Hamkor ismi..."
              />
              {errors.name && (
                <div className="text-xs text-red-500">
                  {errors.name.message}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-primary" />
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefon raqam
                </Label>
              </div>
              <Phone
                id="phone"
                name="phone"
                placeholder="+998 90 123 45 67"
                className="h-11 bg-background/80 border-border/50 focus:border-primary/50"
              />
              {errors.phone && (
                <div className="text-xs text-red-500">
                  {errors.phone.message}
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
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Yangilanmoqda...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Yangilash
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
