import { useCreateSaleMutation } from '@/api/sales';
import { MeasureType } from '@/interfaces/raw-material/raw-materials';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { format } from 'date-fns';
import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { PrintableCard, SaleRequest } from './printableCard';

export type SaleItem = {
  id: string;
  name: string;
  kind: 'product'; // ✅ only product
  price: number; // UZS
  amount: number;
  measure?: MeasureType;
  imageUrl?: string;
};

type ProductRate = { usdToUzs: number };

/** Default sell price configuration */
export interface DefaultSellPrice {
  id: string; // SaleItem.id
  price: number; // UZS
}

export type SaleLineItem = {
  id: string;
  kind: 'product'; // ✅ only product
  name: string;
  qty: number;
  measure?: MeasureType;
  unitPrice: number; // UZS
  lineTotal: number; // qty * unitPrice
};

type UUID = string;

export default function Detail({ items }: { items: SaleItem[] }) {
  const componentRef = useRef<HTMLDivElement>(null);
  const cartItems = useAppSelector((s) => s.cart.items);
  const [createSale, { isLoading }] = useCreateSaleMutation();
  const currentDate = format(new Date(), 'MMMM dd, yyyy');
  const dispatch = useAppDispatch();

  // UI states
  const [visible, setVisible] = useState(true);
  const [success, setSuccess] = useState(false);
  const [customerId, setCustomerId] = useState<string>('');
  const [paymentType, setPaymentType] = useState<PaymentType>('CASH');

  const [defaultSellPrice, setDefaultSellPrice] = useState<DefaultSellPrice[]>(
    []
  );

  const [paymentUzs, setPaymentUzs] = useState<number>(0);

  const byId = useMemo(() => {
    const m = new Map<string, SaleItem>();
    (items ?? []).forEach((it) => m.set(String(it.id), it));
    return m;
  }, [items]);

  const selectedProducts: SaleLineItem[] = useMemo(() => {
    if (!cartItems?.length) return [];
    return cartItems
      .map(({ id, q }) => {
        const strId = String(id);
        const it = byId.get(strId);
        if (!it) return null;

        const override = defaultSellPrice.find((d) => d.id === strId);
        const unit = Number(override?.price ?? it.price ?? 0);

        return {
          id: strId,
          name: it.name,
          kind: 'product',
          measure: it.measure,
          qty: q,
          unitPrice: unit,
          lineTotal: q * unit,
        } as SaleLineItem;
      })
      .filter(Boolean) as SaleLineItem[];
  }, [cartItems, byId, defaultSellPrice]);

  const grandTotal = useMemo(
    () => selectedProducts.reduce((sum, it) => sum + it.lineTotal, 0),
    [selectedProducts]
  );

  const remained = useMemo(
    () => Math.max(0, Math.round(grandTotal - paymentUzs)),
    [grandTotal, paymentUzs]
  );

  const handleSetDebtors: Dispatch<SetStateAction<string>> = (val) => {
    const resolved =
      typeof val === 'function' ? val(String(customerId || '')) : val;
    setCustomerId(resolved ? String(resolved) : '');
  };

  /** Checkout — updated to match new backend structure */
  const handleCheckout = async (_payloadFromPrintable: SaleRequest) => {
    if (!selectedProducts.length) {
      toast.error('Savat bo\'sh');
      return;
    }

    const { products, comment } = _payloadFromPrintable;

    const payload: CreateSalePayload = {
      clientId: customerId as UUID, // required (UI majburiy qiladi)
      products: products.map((p) => ({
        productId: p.productId as UUID,
        amount: p.amount,
        soldPrice: p.soldPrice,
      })),
      paid: paymentUzs,
      paymentType: paymentUzs > 0 ? paymentType : undefined,
      comment,
    };

    try {
      await createSale(payload).unwrap();
      toast.success('Sotuv yakunlandi');
      setSuccess(true);
      // print uchun state saqlanadi
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Checkoutda xatolik yuz berdi');
    }
  };

  // “Sotuvga qaytish”
  const handleBackToSale = () => {
    dispatch(clearCart());
    setDefaultSellPrice([]);
    setPaymentUzs(0);
    setCustomerId('');
    setSuccess(false);
    setVisible(false);
  };

  return (
    <div>
      <div ref={componentRef}>
        {visible && (
          <PrintableCard
            success={success}
            onBackToSale={handleBackToSale}
            data={selectedProducts.map((p) => ({
              id: p.id,
              name: p.name,
              kind: p.kind,
              measure: p.measure,
              qty: p.qty,
              unitPrice: p.unitPrice,
              lineTotal: p.lineTotal,
            }))}
            totalQuantity={grandTotal}
            currentDate={currentDate}
            loading={isLoading}
            handleCheckout={handleCheckout}
            debtors={customerId || ''}
            setDebtors={handleSetDebtors}
            isDebtor={remained}
            defaultSellPrice={defaultSellPrice}
            setDefaultSellPrice={setDefaultSellPrice}
            payments={[{ id: 'uzs', method: 'cash', amount: paymentUzs }]}
            addPayment={() => null}
            removePayment={() => null}
            updatePayment={(_, __, val) => setPaymentUzs(Number(val) || 0)}
            totalPaid={paymentUzs}
          />
        )}
      </div>
    </div>
  );
}
