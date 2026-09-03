import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistStorage } from "@/lib/storage";

import type { CustomerDetails, ShippingOptionId } from "@/types";

export const EMPTY_CUSTOMER: CustomerDetails = {
  fullName: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "Phnom Penh",
  postalCode: "",
  note: "",
};

interface CheckoutDraftState {
  customer: CustomerDetails;
  shippingOptionId: ShippingOptionId;
  promoCode: string | null;
  /** Field names with a failed validation pass, used to show inline errors. */
  touched: Record<string, boolean>;
  setCustomerField: (field: keyof CustomerDetails, value: string) => void;
  setShippingOption: (id: ShippingOptionId) => void;
  setPromoCode: (code: string | null) => void;
  markTouched: (fields: string[]) => void;
  resetDraft: () => void;
}

/**
 * The draft form is kept separate from the order so a shopper can leave checkout, browse
 * on, and come back without retyping. Only `customer` and delivery choice are persisted.
 */
export const useCheckoutDraft = create<CheckoutDraftState>()(
  persist(
    (set, get) => ({
      customer: EMPTY_CUSTOMER,
      shippingOptionId: "standard",
      promoCode: null,
      touched: {},

      setCustomerField: (field, value) =>
        set({ customer: { ...get().customer, [field]: value } }),

      setShippingOption: (id) => set({ shippingOptionId: id }),

      setPromoCode: (code) => set({ promoCode: code }),

      markTouched: (fields) => {
        const touched = { ...get().touched };
        for (const field of fields) touched[field] = true;
        set({ touched });
      },

      resetDraft: () =>
        set({ customer: EMPTY_CUSTOMER, shippingOptionId: "standard", promoCode: null, touched: {} }),
    }),
    {
      name: "jinghub.checkout",
      storage: persistStorage,
      partialize: (state) => ({ customer: state.customer, shippingOptionId: state.shippingOptionId }),
    },
  ),
);

export interface CustomerValidation {
  ok: boolean;
  errors: Partial<Record<keyof CustomerDetails, string>>;
}

/** Hand-rolled validation keeps the bundle small; the rules mirror real PSP mandates. */
export function validateCustomer(customer: CustomerDetails, shippingRequired: boolean): CustomerValidation {
  const errors: Partial<Record<keyof CustomerDetails, string>> = {};

  if (customer.fullName.trim().length < 3) errors.fullName = "Enter the full name on the order";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email.trim())) {
    errors.email = "A valid email is needed for the receipt";
  }
  const digits = customer.phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 14) {
    errors.phone = "Enter a reachable phone number (8–14 digits)";
  }
  if (shippingRequired) {
    if (customer.addressLine.trim().length < 6) errors.addressLine = "Street, building and Sangkat";
    if (customer.city.trim().length < 2) errors.city = "City or Khan is required";
    if (!/^\d{4,6}$/.test(customer.postalCode.trim())) errors.postalCode = "Postal code is 4–6 digits";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
