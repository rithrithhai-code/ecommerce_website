import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistStorage } from "@/lib/storage";
import type { TranslationKey } from "@/i18n/en";

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
  errors: Partial<Record<keyof CustomerDetails, TranslationKey>>;
}

/**
 * Hand-rolled validation keeps the bundle small. Messages come back as translation keys,
 * resolved by CustomerForm through `t()`, so this store stays locale-free.
 */
export function validateCustomer(
  customer: CustomerDetails,
  shippingRequired: boolean,
): CustomerValidation {
  const errors: CustomerValidation["errors"] = {};

  if (customer.fullName.trim().length < 3) errors.fullName = "form.errors.fullName";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email.trim())) {
    errors.email = "form.errors.email";
  }
  const digits = customer.phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 14) {
    errors.phone = "form.errors.phone";
  }
  if (shippingRequired) {
    if (customer.addressLine.trim().length < 6) errors.addressLine = "form.errors.street";
    if (customer.city.trim().length < 2) errors.city = "form.errors.city";
    if (!/^\d{4,6}$/.test(customer.postalCode.trim())) errors.postalCode = "form.errors.postal";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
