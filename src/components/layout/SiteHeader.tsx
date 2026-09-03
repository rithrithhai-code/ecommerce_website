import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Moon, Search, ShoppingBag, Sun, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { CURRENCY_LABEL } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useCartCount } from "@/hooks/useCartView";
import { usePreferences } from "@/store/preferences";
import type { CurrencyCode } from "@/types";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?sort=rating", label: "Top rated" },
  { to: "/orders", label: "My orders" },
  { to: "/how-to-pay", label: "How KHQR works" },
];

const TICKER = [
  "KHQR & Bakong accepted",
  "Free delivery over $150",
  "24-month warranty on tech",
  "Same-day express in BKK1",
];

function CurrencySwitch() {
  const currency = usePreferences((state) => state.currency);
  const setCurrency = usePreferences((state) => state.setCurrency);
  const options: CurrencyCode[] = ["USD", "KHR"];

  return (
    <div
      className="flex items-center rounded-full border border-line bg-surface-2 p-0.5"
      role="group"
      aria-label="Display currency"
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

function ThemeSwitch() {
  const theme = usePreferences((state) => state.theme);
  const toggleTheme = usePreferences((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-9 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-muted transition hover:text-fg"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b border-line bg-fg py-2 text-canvas">
      <div className="flex w-max animate-marquee gap-10 pr-10">
        {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((item, index) => (
          <span key={index} className="flex items-center gap-2 text-[12px] font-medium tracking-wide">
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
  const openDrawer = useCart((state) => state.openDrawer);
  const count = useCartCount();

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
          scrolled
            ? "border-line bg-canvas/85 backdrop-blur-xl"
            : "border-transparent bg-canvas/60 backdrop-blur-sm",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full border border-line text-fg-muted lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <Logo />

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-surface-2 text-fg"
                      : "text-fg-muted hover:bg-surface-2/70 hover:text-fg",
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
                placeholder="Search headphones, laptops…"
                aria-label="Search products"
                className="h-10 w-full rounded-full border border-line bg-surface-2 pr-3 pl-9 text-sm transition placeholder:text-fg-faint focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <span className="hidden sm:inline">
              <CurrencySwitch />
            </span>
            <span className="hidden sm:inline">
              <ThemeSwitch />
            </span>

            <button
              type="button"
              onClick={openDrawer}
              className="relative flex h-9 items-center gap-2 rounded-full bg-fg px-3.5 text-[13px] font-semibold text-canvas transition hover:opacity-90"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag size={16} />
              <span className="tabular-nums">{count}</span>
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
                    placeholder="Search products"
                    aria-label="Search products"
                    className="h-11 w-full rounded-full border border-line bg-surface-2 px-4 text-sm focus:border-brand focus:outline-none"
                  />
                </form>

                {NAV.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="flex items-center gap-2 pt-1 sm:hidden">
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
