// components/partners/SheetAdd.tsx
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Phone } from '@/components/hook-form/phone';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import {
  Users,
  User,
  Phone as PhoneIcon,
  DollarSign,
  Scale,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { NumericFormat } from 'react-number-format';
import { useAddPartnersMutation } from '@/api/partners';

// --- Payload tipi (backendga yuboriladigan) ---
type CreatePartnerPayload = {
  name: string;
  phone: string;
};

// --- Form schema ---
// credit: sizning partnerga qarzingiz (partner krediti)
// debt: partnerning sizga qarzi
const PartnerSchema = z.object({
  name: z.string().min(1, 'Ism majburiy'),
  phone: z.string().regex(/^\d{9}$/, "Telefon raqam 9 raqamdan bo'lishi kerak"),
});

type PartnerForm = z.infer<typeof PartnerSchema>;

export function SheetAdd({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const methods = useForm<PartnerForm>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
    watch,
  } = methods;

  const [createPartner] = useAddPartnersMutation();

  const onSubmit = async (form: PartnerForm) => {
    const payload: CreatePartnerPayload = {
      name: form.name.trim(),
      phone: `+998${form.phone}`,
    };

    try {
      await createPartner(payload).unwrap();
      toast.success("Hamkor qo'shildi");
      reset();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.";
      toast.error(msg);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] sm:w-[560px] bg-background/95 backdrop-blur-sm border-l border-border/50">
        <SheetHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">
                Yangi hamkor qo‘shish
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Oldingi hisob-kitoblar bo‘lsa, <strong>credit/debt</strong>{' '}
                maydonlariga kiriting (aks holda 0 qoldiring).
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
                name="phone"
                id="phone"
                className="h-11 border-border/50 focus:border-primary/50"
                placeholder="+998 90 123 45 67"
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
                    Qo‘shilmoqda...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Hamkor qo‘shish
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
