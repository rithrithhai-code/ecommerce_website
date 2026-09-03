import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistStorage } from "@/lib/storage";

import type { CurrencyCode, Theme } from "@/types";

interface PreferencesState {
  theme: Theme;
  currency: CurrencyCode;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCurrency: (currency: CurrencyCode) => void;
}

function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Theme and display currency are global preferences: prices are stored in USD and
 * converted at render time, so switching never rewrites cart or order data.
 */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: "light",
      currency: "USD",
      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        applyThemeClass(next);
        set({ theme: next });
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "khmart.preferences",
      storage: persistStorage,
      partialize: (state) => ({ theme: state.theme, currency: state.currency }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme);
      },
    },
  ),
);
