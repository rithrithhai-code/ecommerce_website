import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistStorage } from "@/lib/storage";

import type { CurrencyCode, Lang, Theme } from "@/types";

interface PreferencesState {
  theme: Theme;
  currency: CurrencyCode;
  language: Lang;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: Lang) => void;
}

function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * `lang` on the root element drives the Khmer font stack through CSS and is what screen
 * readers use to pick a Khmer voice, so it is applied here rather than per component.
 */
function applyLanguageAttribute(language: Lang): void {
  document.documentElement.lang = language === "km" ? "km" : "en";
}

/**
 * Theme, currency and language are global preferences: prices are stored in USD and text is
 * resolved at render time, so switching any of them never rewrites cart or order data.
 */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: "light",
      currency: "USD",
      language: "en",
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
      setLanguage: (language) => {
        applyLanguageAttribute(language);
        set({ language });
      },
    }),
    {
      name: "jinghub.preferences",
      storage: persistStorage,
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        language: state.language,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeClass(state.theme);
          applyLanguageAttribute(state.language);
        }
      },
    },
  ),
);
