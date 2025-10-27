import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { SearchSelect } from '@/components/ui/search-select';
import { NumericFormat } from 'react-number-format';
import { formatQuantity } from '@/lib/utils';
import { User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreatePaymentMutation } from '@/api/debts';

export function DialogPayment({
  open,
  setOpen,
  userId,
  totalAmount,
  clientId,
  saleId,
  supplierId,
  rawMaterialLogId,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
  totalAmount: number;
  clientId?: string;
  saleId?: string;
  supplierId?: string;
  rawMaterialLogId?: string;
}) {
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  const mode: 'supplier' | 'client' | 'invalid' = (() => {
    const hasSupplier = Boolean(supplierId && rawMaterialLogId);
    const hasClient = Boolean(clientId && saleId);
    if (hasSupplier && !hasClient) return 'supplier';
    if (!hasSupplier && hasClient) return 'client';
    return 'invalid';
  })();
  const isSupplier = mode === 'supplier';

  const [amount, setAmount] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('CASH');
  const [paymentError, setPaymentError] = useState('');

  const paymentTypeOptions = [
    { id: 'CASH', label: 'Naqd pul', value: 'CASH' },
    { id: 'CARD', label: 'Plastik karta', value: 'CARD' },
    { id: 'TRANSFER', label: 'Bank o\'tkazmasi', value: 'TRANSFER' },
  ];

  useEffect(() => {
    if (open) {
      setAmount(0);
      setComment('');
      setPaymentType('CASH');
      setPaymentError('');
    }
  }, [open]);

  const fmtUzs = (n: number) => `${formatQuantity(n)} so'm`;

  const paidAmount = amount || 0;

  const totalAmountDisplay = useMemo(() => {
    return { value: totalAmount, text: fmtUzs(totalAmount) };
  }, [totalAmount]);

  const remainingDebtDisplay = useMemo(() => {
    const remain = Math.max(0, totalAmount - paidAmount);
    return { value: remain, text: fmtUzs(remain) };
  }, [totalAmount, paidAmount]);

  const onSubmit = async () => {
    if (mode === 'invalid' || !userId) {
      setPaymentError(
        "Texnik xato: kerakli identifikatorlar to'liq emas (clientId+saleId yoki supplierId+rawMaterialLogId)."
      );
      return;
    }
    if ((amount || 0) <= 0) {
      setPaymentError(`Summani kiriting (${isSupplier ? "so'm" : "so'm"})`);
      return;
    }
    if (paidAmount > totalAmount) {
      setPaymentError("To'lov qarzdan oshib ketdi");
      return;
    }

    const payload = {
      amount,
      from: mode === 'client' ? (clientId as string) : userId,
      to: mode === 'client' ? userId : (supplierId as string),
      comment: comment?.trim() || undefined,
      paymentType,
      ...(mode === 'client' ? { transactionId: saleId as string } : {}),
      ...(mode === 'supplier' && rawMaterialLogId ? { rawMaterialLogId } : {}),
    } as any;

    try {
      await createPayment(payload).unwrap();
      toast.success("To'lov muvaffaqiyatli amalga oshirildi");
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || "Xatolik yuz berdi, qaytadan urinib ko'ring"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                To'lov qilish
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isSupplier
                  ? "Ta'minotchiga nisbatan qarzdorlikni to'lash (UZS kiritiladi)"
                  : "Mijoz qarzini to'lash (UZS kiritiladi)"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6 p-6"
        >
          <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Jami qarzdorlik:</span>
              <div className="text-right font-bold text-lg text-red-600">
                {totalAmountDisplay.text}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                To'lov miqdori ({isSupplier ? "so'm" : "so'm"})
              </Label>
              <NumericFormat
                placeholder="0"
                value={amount || ''}
                onValueChange={({ floatValue }) => {
                  setPaymentError('');
                  setAmount(floatValue || 0);
                }}
                allowNegative={false}
                thousandSeparator=" "
                decimalScale={isSupplier ? 2 : 0}
                customInput={Input}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                To'lov turi
              </Label>
              <SearchSelect
                value={paymentType}
                onValueChange={(value) => setPaymentType(value as PaymentType)}
                placeholder="To'lov turini tanlang"
                options={paymentTypeOptions}
                className="h-10"
              />
            </div>
          </div>

          {paymentError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {paymentError}
              </span>
            </div>
          )}

          <div className="bg-muted/20 rounded-lg p-4 space-y-3 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Qoldiq:</span>
              <div className="text-right">
                <span
                  className={`font-bold text-sm ${
                    remainingDebtDisplay.value > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {remainingDebtDisplay.text}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Izoh (ixtiyoriy)
            </Label>
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Masalan: Qarzdorlik uchun to'lov"
              className="h-10"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "To'lanmoqda..." : "To'lash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
