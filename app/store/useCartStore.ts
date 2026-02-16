import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  quantity: number;
};

interface CartState {
  cart: CartItem[];
  addItem: (product: any) => void;
  decrementItem: (id: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addItem: (product) => {
        const cart = get().cart;
        const existingItem = cart.find((item) => item.id === product.id);
        if (existingItem) {
          set({
            cart: cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          set({ cart: [...cart, { ...product, quantity: 1, priceNum: parseInt(product.price.replace("Rs ", "")) }] });
        }
      },
      decrementItem: (id) => {
        const cart = get().cart;
        const item = cart.find((i) => i.id === id);
        if (item && item.quantity > 1) {
          set({ cart: cart.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i)) });
        } else {
          get().removeItem(id);
        }
      },
      removeItem: (id) => set({ cart: get().cart.filter((item) => item.id !== id) }),
      clearCart: () => set({ cart: [] }),
      getTotal: () => get().cart.reduce((acc, item) => acc + item.priceNum * item.quantity, 0),
      getItemCount: () => get().cart.reduce((acc, item) => acc + item.quantity, 0),
    }),
    { name: 'raj-biryani-storage' }
  )
);