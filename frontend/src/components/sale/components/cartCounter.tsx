import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCartItem } from '@/store/slices/cartSlice';
import { Counter } from './counter';

export interface CartCounterProps {
  id: string; // 🔒 string id (uuid)
  quantity: number; // ombordagi mavjud miqdor (max)
  isSmall: boolean; // UI hajmi
}

export const CartCounter = ({ id, quantity, isSmall }: CartCounterProps) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);

  // id ni qat’iy string sifatida ishlatamiz
  const normId = String(id);

  // Hozirgi miqdor (q) — cart ichida ham string id bilan solishtiramiz
  const currentQuantity = cart.find((item) => item.id === normId)?.q ?? 0;

  const handleChange = (newValue: number) => {
    // slice update payloadi string id kutadi
    dispatch(updateCartItem({ id: normId, quantity: newValue }));
  };

  return (
    <Counter
      value={currentQuantity}
      onChange={handleChange}
      min={0}
      max={quantity}
      size={isSmall ? 'sm' : 'md'}
    />
  );
};
