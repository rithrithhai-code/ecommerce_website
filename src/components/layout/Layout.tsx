import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useI18n } from "@/i18n";

function ScrollToTop() {
  const { pathname } = useLocation();
  const normalised = pathname.replace(/\/+$/, "") || "/";
  const previous = useRef(normalised);

  useEffect(() => {
    if (previous.current === normalised) return;
    previous.current = normalised;
    window.scrollTo({ top: 0 });
  }, [normalised]);

  return null;
}

export function Layout() {
  const { t, lang, dict } = useI18n();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang === "km" ? "km" : "en";
    root.style.setProperty("color-scheme", lang === "km" ? "light dark" : "light dark");
    document.title = dict.meta.title;
  }, [lang, dict.meta.title]);

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Ambient layers sit behind everything and ignore pointer events. */}
      <div className="bg-aurora pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
      <div className="bg-grid pointer-events-none fixed inset-0 -z-10 opacity-40" aria-hidden="true" />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-contrast"
      >
        {t("meta.skipToContent")}
      </a>

      <ScrollToTop />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
