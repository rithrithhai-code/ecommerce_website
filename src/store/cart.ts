import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistStorage } from "@/lib/storage";

import { getProductById } from "@/data/products";
import type { CartLine } from "@/types";

interface CartState {
  lines: CartLine[];
  drawerOpen: boolean;
  /** Drives the "Added" confirmation on the trigger button. */
  lastAddedId: string | null;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

function clampQty(qty: number, stock: number): number {
  return Math.max(1, Math.min(Math.trunc(qty), Math.max(1, stock)));
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      drawerOpen: false,
      lastAddedId: null,

      add: (productId, qty = 1) => {
        const product = getProductById(productId);
        if (!product || product.stock <= 0) return;

        const existing = get().lines.find((line) => line.productId === productId);
        const lines = existing
          ? get().lines.map((line) =>
              line.productId === productId
                ? { ...line, qty: clampQty(line.qty + qty, product.stock) }
                : line,
            )
          : [...get().lines, { productId, qty: clampQty(qty, product.stock) }];

        set({ lines, lastAddedId: productId, drawerOpen: true });
      },

      setQty: (productId, qty) => {
        const product = getProductById(productId);
        if (!product) return;
        if (qty <= 0) {
          set({ lines: get().lines.filter((line) => line.productId !== productId) });
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.productId === productId ? { ...line, qty: clampQty(qty, product.stock) } : line,
          ),
        });
      },

      remove: (productId) => set({ lines: get().lines.filter((line) => line.productId !== productId) }),

      clear: () => set({ lines: [], lastAddedId: null }),

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "khmart.cart",
      storage: persistStorage,
      // Drawer visibility and the "added" flash are view state, not data.
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}
