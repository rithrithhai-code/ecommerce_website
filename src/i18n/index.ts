import { useCallback } from "react";

import { en, type Dict, type Params, type TranslationKey } from "./en";
import { km } from "./km";
import type { Lang } from "@/types";
import { usePreferences } from "@/store/preferences";

export { en, km };

export type { Dict, Params, TranslationKey } from "./en";

const dictionaries: Record<Lang, Dict> = { en, km };

export const LANGUAGES: Array<{ code: Lang; label: string; short: string }> = [
  { code: "en", label: "English", short: "EN" },
  { code: "km", label: "ខ្មែរ", short: "ខ្មែរ" },
];

/** BCP-47 tags used for date and number formatting. */
export const LOCALE_TAG: Record<Lang, string> = {
  en: "en-GB",
  km: "km-KH",
};

function lookup(dict: Dict, path: string): string | undefined {
  let node: unknown = dict;
  for (const segment of path.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/**
 * Translate outside a component — used by validation helpers and data lookups that receive
 * the language explicitly. Falls back to English when a Khmer string is missing or empty,
 * so a partial translation never renders a blank label.
 */
export function translate(lang: Lang, key: TranslationKey, params?: Params): string {
  const value = lookup(dictionaries[lang], key) ?? lookup(en, key);
  return interpolate(value ?? key, params);
}

export interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Structured access for lists and tables, e.g. `dict.how.steps.map(...)`. */
  dict: Dict;
  t: (key: TranslationKey, params?: Params) => string;
  locale: string;
}

export function useI18n(): I18n {
  const lang = usePreferences((state) => state.language);
  const setLang = usePreferences((state) => state.setLanguage);

  const t = useCallback(
    (key: TranslationKey, params?: Params) => translate(lang, key, params),
    [lang],
  );

  return {
    lang,
    setLang,
    toggleLang: () => setLang(lang === "km" ? "en" : "km"),
    dict: dictionaries[lang],
    t,
    locale: LOCALE_TAG[lang],
  };
}
