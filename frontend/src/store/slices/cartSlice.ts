// src/store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string; // UUID
  q: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add/Update item
    updateCartItem: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        // quantity 0 yoki manfiy bo'lsa – o'chiramiz
        state.items = state.items.filter((item) => item.id !== id);
        return;
      }

      const existing = state.items.find((item) => item.id === id);
      if (existing) {
        existing.q = quantity;
      } else {
        state.items.push({ id, q: quantity });
      }
    },

    // Remove ALL or by id
    removeCartItem: (state, action: PayloadAction<string | null>) => {
      const id = action.payload;
      if (id === null) {
        state.items = [];
      } else {
        state.items = state.items.filter((item) => item.id !== id);
      }
    },

    // Clear cart
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { updateCartItem, removeCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
