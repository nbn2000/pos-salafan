// components/customers/SheetAddCustomer.tsx
import { useAddClientMutation } from '@/api/clients';
import { Phone } from '@/components/hook-form/phone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Phone as PhoneIcon, User, Users } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// --- Form schema ---
// debt: mijozning sizga qarzi, >= 0, 2 kasrgacha ruxsat
const CustomerSchema = z.object({
  name: z.string().min(1, 'Ism majburiy'),
  phone: z.string().regex(/^\d{9}$/, "Telefon raqam 9 raqamdan bo'lishi kerak"),
  address: z.string().optional().default(''),
  description: z.string().optional().default(''),
  debt: z
    .string()
    .default('0')
    .transform((v) => {
      const raw = v.trim() === '' ? '0' : v.replace(/\s/g, '');
      const n = Number(raw);
      return Number.isNaN(n) ? 0 : Number(n.toFixed(2));
    })
    .refine((v) => v >= 0, { message: 'Debt manfiy bo‘lishi mumkin emas' }),
});

type CustomerForm = z.infer<typeof CustomerSchema>;

export function SheetAdd({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const methods = useForm<CustomerForm>({
    resolver: zodResolver(CustomerSchema),
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
  } = methods;

  const [createCustomer] = useAddClientMutation();

  const onSubmit = async (form: CustomerForm) => {
    try {
      await createCustomer({
        name: form.name.trim(),
        phone: `+998${form.phone}`,
      }).unwrap();

      toast.success("Mijoz qo'shildi");
      reset();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring."
      );
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
                Yangi mijoz qo‘shish
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Agar avvaldan qarzi bo‘lsa, <b>Debt</b> maydoniga kiriting (aks
                holda 0 qoldiring).
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
                placeholder="Ismni kiriting..."
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
                    Qo'shilmoqda...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Mijoz qo'shish
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
