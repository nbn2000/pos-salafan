// components/customers/AddDebtorDialog.tsx
import { useAddClientMutation } from '@/api/clients';
import { Phone } from '@/components/hook-form/phone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';
import { Phone as PhoneIcon, User, Users } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// === SheetAddCustomer dagi bilan aynan bir xil schema/logic ===
const CustomerSchema = z.object({
  name: z.string().min(1, 'Ism majburiy'),
  phone: z.string().regex(/^\d{9}$/, "Telefon raqam 9 raqamdan bo'lishi kerak"),
  // Quyidagilar formda yo'q, lekin defaults bilan mos turadi (xuddi sheet’dagi kabi)
  address: z.string().optional().default(''),
  description: z.string().optional().default(''),
  debt: z
    .string()
    .default('0')
    .transform((v) => {
      const raw = v.trim() === '' ? '0' : v.replace(/\s/g, '');
      const n = Number(raw);
      return Number.isNaN(n) ? 0 : Number(n.toFixed(2));
    }),
});
type CustomerForm = z.infer<typeof CustomerSchema>;

export function AddDebtorDialog({
  open,
  onClose,
  onClientCreated,
}: {
  open: boolean;
  onClose: () => void;
  onClientCreated?: (client: { id: string; name: string; phone: string }) => void;
}) {
  const methods = useForm<CustomerForm>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: { name: '', phone: '' },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const [createCustomer] = useAddClientMutation();

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (form: CustomerForm) => {
    try {
      const createdClient = await createCustomer({
        name: form.name.trim(),
        phone: `+998${form.phone}`,
      }).unwrap();

      toast.success("Mijoz qo'shildi");
      
      // Call the callback with the created client data
      if (onClientCreated && createdClient) {
        onClientCreated({
          id: createdClient.id,
          name: createdClient.name,
          phone: createdClient.phone,
        });
      }
      
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
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-[560px] bg-background/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Yangi mijoz qo‘shish
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Ism va telefon raqamini kiriting.
              </DialogDescription>
            </div>
          </div>

          <div
            onClick={handleCancel}
            className="absolute right-4 top-4 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
          >
            <Cross2Icon className="h-4 w-4" />
          </div>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            {/* Name */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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

            <DialogFooter className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
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
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
