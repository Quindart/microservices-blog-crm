"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  accent: string;
  plan?: string;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const quantity = item.quantity ?? 1;
          const existingItem = state.items.find((cartItem) => cartItem.id === item.id);

          if (existingItem) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + quantity }
                  : cartItem,
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity }] };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity > 0
              ? state.items.map((item) => (item.id === id ? { ...item, quantity } : item))
              : state.items.filter((item) => item.id !== id),
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "author-store-cart" },
  ),
);
