import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Globe, Menu, Moon, Search, ShoppingBag, Sun, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { CURRENCY_LABEL } from "@/lib/format";
import { LANGUAGES, useI18n } from "@/i18n";
import { useCart } from "@/store/cart";
import { useCartCount } from "@/hooks/useCartView";
import { usePreferences } from "@/store/preferences";
import type { CurrencyCode } from "@/types";

function CurrencySwitch() {
  const currency = usePreferences((state) => state.currency);
  const setCurrency = usePreferences((state) => state.setCurrency);
  const { t } = useI18n();
  const options: CurrencyCode[] = ["USD", "KHR"];

  return (
    <div
      className="flex items-center rounded-full border border-line bg-surface-2 p-0.5"
      role="group"
      aria-label={t("nav.currency")}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setCurrency(option)}
          aria-pressed={currency === option}
          title={CURRENCY_LABEL[option]}
          className={cn(
            "h-7 rounded-full px-2.5 text-[12px] font-semibold transition",
            currency === option
              ? "bg-surface text-fg shadow-soft"
              : "text-fg-faint hover:text-fg-muted",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/**
 * Language switch. Khmer is written as its own endonym, so the control stays recognisable
 * whichever language is currently active.
 */
function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-line bg-surface-2 p-0.5"
      role="group"
      aria-label={t("nav.language")}
    >
      {!compact ? (
        <Globe size={13} className="ml-1.5 shrink-0 text-fg-faint" aria-hidden="true" />
      ) : null}
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          lang={option.code}
          className={cn(
            "h-7 rounded-full px-2.5 text-[12px] font-semibold transition",
            lang === option.code
              ? "bg-surface text-fg shadow-soft"
              : "text-fg-faint hover:text-fg-muted",
          )}
        >
          {option.short}
        </button>
      ))}
    </div>
  );
}

function ThemeSwitch() {
  const theme = usePreferences((state) => state.theme);
  const toggleTheme = usePreferences((state) => state.toggleTheme);
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-9 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-muted transition hover:text-fg"
      aria-label={theme === "dark" ? t("nav.themeToLight") : t("nav.themeToDark")}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function AnnouncementBar() {
  const { dict } = useI18n();
  const ticker = [
    dict.ticker.khqr,
    dict.ticker.freeDelivery,
    dict.ticker.warranty,
    dict.ticker.sameDay,
  ];

  return (
    <div className="overflow-hidden border-b border-line bg-gradient-to-r from-fg via-fg to-brand-strong py-2 text-canvas">
      <div className="animate-marquee flex w-max gap-10 pr-10 hover:[animation-play-state:paused]">
        {[...ticker, ...ticker, ...ticker, ...ticker].map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-2 text-[12px] font-medium tracking-wide">
            <span className="size-1 rounded-full bg-brand" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { t, dict } = useI18n();
  const openDrawer = useCart((state) => state.openDrawer);
  const count = useCartCount();

  const nav = [
    { to: "/shop", label: dict.nav.shop },
    { to: "/shop?sort=rating", label: dict.nav.topRated },
    { to: "/orders", label: dict.nav.orders },
    { to: "/how-to-pay", label: dict.nav.howToPay },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : "/shop");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40">
      <AnnouncementBar />
      <div
        className={cn(
          "border-b transition-colors duration-300",
          scrolled ? "glass border-line" : "border-transparent bg-canvas/60 backdrop-blur-sm",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full border border-line text-fg-muted lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={t(menuOpen ? "nav.closeMenu" : "nav.toggleMenu")}
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <Logo />

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "relative px-3 py-2 text-sm font-medium transition after:absolute after:inset-x-3 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-brand after:to-gold after:transition-transform after:duration-300",
                    isActive
                      ? "text-fg after:scale-x-100"
                      : "text-fg-muted hover:text-fg hover:after:scale-x-100",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 md:block" role="search">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-faint"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                aria-label={t("nav.searchAria")}
                className="h-10 w-full rounded-full border border-line bg-surface-2/80 pr-3 pl-9 text-sm transition placeholder:text-fg-faint hover:border-line-strong focus:border-brand focus:bg-surface focus:shadow-soft focus:ring-4 focus:ring-brand/12 focus:outline-none"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <span className="hidden sm:inline">
              <LanguageSwitch />
            </span>
            <span className="hidden sm:inline">
              <CurrencySwitch />
            </span>
            <span className="hidden sm:inline">
              <ThemeSwitch />
            </span>

            <button
              type="button"
              onClick={openDrawer}
              className="relative flex h-9 items-center gap-2 rounded-full bg-fg px-3.5 text-[13px] font-semibold text-canvas transition hover:scale-[1.04] hover:opacity-95 active:scale-100"
              aria-label={t("nav.openCart", {
                count,
                plural: count === 1 ? t("nav.item") : t("nav.items"),
              })}
            >
              <ShoppingBag size={16} />
              <span key={count} className="animate-pop tabular-nums">
                {count}
              </span>
              {count > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-brand ring-2 ring-canvas" />
              ) : null}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen ? (
            <motion.nav
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden border-t border-line bg-canvas lg:hidden"
            >
              <div className="space-y-3 px-4 py-4 sm:px-6">
                <form onSubmit={submitSearch} className="md:hidden" role="search">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("nav.searchPlaceholder")}
                    aria-label={t("nav.searchAria")}
                    className="h-11 w-full rounded-full border border-line bg-surface-2 px-4 text-sm focus:border-brand focus:outline-none"
                  />
                </form>

                {nav.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="flex flex-wrap items-center gap-2 pt-1 sm:hidden">
                  <LanguageSwitch compact />
                  <CurrencySwitch />
                  <ThemeSwitch />
                </div>
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
