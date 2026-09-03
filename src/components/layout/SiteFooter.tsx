import { Mail, MapPin, Phone, QrCode } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/ui/Logo";
import { CATEGORIES } from "@/data/products";
import { SUPPORT_CONTACT } from "@/data/merchant";
import { paymentProvider } from "@/api/payment";

const COMPANY_LINKS = [
  { to: "/how-to-pay", label: "How KHQR works" },
  { to: "/orders", label: "Track an order" },
  { to: "/shop", label: "All products" },
  { to: "/cart", label: "Cart" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface/70">
      <div className="mx-auto grid max-w-[88rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-fg-muted">
            A demo storefront for modern commerce: React, TypeScript and Tailwind on the front,
            and a real EMVCo payload driving the checkout QR.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-fg-muted">
            <QrCode size={14} className="text-brand" />
            KHQR / Bakong · {paymentProvider === "live" ? "live API" : "sandbox simulator"}
          </p>
        </div>

        <nav aria-label="Shop categories">
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-fg uppercase">Shop</h2>
          <ul className="space-y-2 text-sm text-fg-muted">
            {CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link to={`/shop?category=${category.id}`} className="transition hover:text-brand">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-fg uppercase">Company</h2>
          <ul className="space-y-2 text-sm text-fg-muted">
            {COMPANY_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-fg uppercase">Flagship</h2>
          <ul className="space-y-2.5 text-sm text-fg-muted">
            <li className="flex gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-brand" />
              {SUPPORT_CONTACT.address}
            </li>
            <li className="flex gap-2">
              <Phone size={15} className="mt-0.5 shrink-0 text-brand" />
              <a href={`tel:${SUPPORT_CONTACT.phone.replace(/\s/g, "")}`}>{SUPPORT_CONTACT.phone}</a>
            </li>
            <li className="flex gap-2">
              <Mail size={15} className="mt-0.5 shrink-0 text-brand" />
              <a href={`mailto:${SUPPORT_CONTACT.email}`}>{SUPPORT_CONTACT.email}</a>
            </li>
            <li className="text-[13px] text-fg-faint">{SUPPORT_CONTACT.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-2 px-4 py-5 text-[12.5px] text-fg-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} KHMart Retail Co. Demo project — not a real shop.</p>
          <p>
            Prices in USD with an indicative 4,100 KHR rate. Payment is simulated unless{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[11.5px]">VITE_PAYMENT_API_BASE</code>{" "}
            is set.
          </p>
        </div>
      </div>
    </footer>
  );
}
