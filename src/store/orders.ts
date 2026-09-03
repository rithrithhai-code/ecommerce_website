import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistStorage } from "@/lib/storage";

import type { Order, PaymentStatus } from "@/types";

interface OrdersState {
  orders: Order[];
  upsert: (order: Order) => void;
  setStatus: (billNumber: string, status: PaymentStatus, paidAt?: string) => void;
  byBillNumber: (billNumber: string) => Order | undefined;
  clearHistory: () => void;
}

/**
 * Order history is persisted locally so the confirmation page and `/orders` survive a
 * refresh. A production build moves this to the server; `Order` is already the shape
 * you would POST.
 */
export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],

      upsert: (order) => {
        const rest = get().orders.filter((candidate) => candidate.id !== order.id);
        set({ orders: [order, ...rest].slice(0, 50) });
      },

      setStatus: (billNumber, status, paidAt) => {
        set({
          orders: get().orders.map((order) =>
            order.reference === billNumber
              ? { ...order, status, paidAt: paidAt ?? order.paidAt }
              : order,
          ),
        });
      },

      byBillNumber: (billNumber) => get().orders.find((order) => order.reference === billNumber),

      clearHistory: () => set({ orders: [] }),
    }),
    {
      name: "khmart.orders",
      storage: persistStorage,
    },
  ),
);
