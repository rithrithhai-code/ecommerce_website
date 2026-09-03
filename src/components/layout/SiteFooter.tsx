import { Mail, MapPin, Phone, QrCode } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/ui/Logo";
import { CATEGORIES } from "@/data/products";
import { SUPPORT_CONTACT } from "@/data/merchant";
import { useI18n } from "@/i18n";
import { paymentProvider } from "@/api/payment";

export function SiteFooter() {
  const { t, dict } = useI18n();
  const companyLinks = [
    { to: "/how-to-pay", label: dict.nav.howToPay },
    { to: "/orders", label: dict.nav.orders },
    { to: "/shop", label: dict.categories.allProducts },
    { to: "/cart", label: dict.cart.title },
  ];

  return (
    <footer className="mt-24 border-t border-line bg-surface/70">
      <div className="mx-auto grid max-w-[88rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-fg-muted">
            {t("footer.about")}
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-fg-muted">
            <QrCode size={14} className="text-brand" />
            {t("footer.provider", {
              mode: paymentProvider === "live" ? t("footer.liveApi") : t("footer.sandbox"),
            })}
          </p>
        </div>

        <nav aria-label={t("footer.shop")}>
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-fg uppercase">{t("footer.shop")}</h2>
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

        <nav aria-label={t("footer.company")}>
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-fg uppercase">{t("footer.company")}</h2>
          <ul className="space-y-2 text-sm text-fg-muted">
            {companyLinks.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-fg uppercase">{t("footer.flagship")}</h2>
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
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p>
            {t("footer.disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
