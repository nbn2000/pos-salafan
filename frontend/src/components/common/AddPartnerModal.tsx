// components/common/AddPartnerModal.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReloadIcon } from '@radix-ui/react-icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Phone } from '@/components/hook-form/phone';
import { FormProvider, useForm } from 'react-hook-form';
import { Users, User, Phone as PhoneIcon } from 'lucide-react';
import { useAddPartnersMutation } from '@/api/partners';

// --- Payload type (sent to backend) ---
type CreatePartnerPayload = {
  name: string;
  phone: string;
};

// --- Form schema ---
const PartnerSchema = z.object({
  name: z.string().min(1, 'Ism majburiy'),
  phone: z.string().regex(/^\d{9}$/, "Telefon raqam 9 raqamdan bo'lishi kerak"),
});

type PartnerForm = z.infer<typeof PartnerSchema>;

interface AddPartnerModalProps {
  open: boolean;
  onClose: () => void;
  onPartnerAdded?: (partner: any) => void; // Callback when partner is successfully created
}

export function AddPartnerModal({
  open,
  onClose,
  onPartnerAdded,
}: AddPartnerModalProps) {
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
  } = methods;

  const [createPartner] = useAddPartnersMutation();

  const onSubmit = async (form: PartnerForm) => {
    const payload: CreatePartnerPayload = {
      name: form.name.trim(),
      phone: `+998${form.phone}`,
    };

    try {
      const result = await createPartner(payload).unwrap();
      toast.success("Hamkor qo'shildi");

      // Call the callback with the new partner data
      if (onPartnerAdded) {
        onPartnerAdded(result);
      }

      reset();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-sm border border-border/50">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Yangi hamkor qo'shish
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Hamkor ma'lumotlarini kiriting
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                className="h-10 bg-background/80 border-border/50 focus:border-primary/50"
                placeholder="Hamkor ismi..."
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
                className="h-10 border-border/50 focus:border-primary/50"
                placeholder="+998 90 123 45 67"
              />
              {errors.phone && (
                <div className="text-xs text-red-500">
                  {errors.phone.message}
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
              </DialogClose>
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
                    Qo'shish
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
