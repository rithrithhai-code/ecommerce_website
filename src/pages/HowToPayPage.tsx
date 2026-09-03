import { CircleCheck, QrCode, ShieldCheck, Smartphone, Zap } from "lucide-react";

import { EmvcoInspector } from "@/components/checkout/EmvcoInspector";
import { ButtonLink } from "@/components/ui/Button";
import { API_BASE, paymentProvider } from "@/api/payment";
import { MERCHANT } from "@/data/merchant";
import { useI18n, type TranslationKey } from "@/i18n";
import { buildKhqrPayload } from "@/lib/emvco";
import { PAYMENT_WINDOW_SECONDS } from "@/lib/order";

const SAMPLE_PAYLOAD = buildKhqrPayload({
  merchant: MERCHANT,
  currency: "USD",
  amount: 348.6,
  billNumber: "KH20260903DEMO01",
});

/** Ordered to match dict.howToPay.rows, one entry per explained field. */
const WALKTHROUGH_TAGS = ["00", "01", "51", "52", "53", "54", "62", "63"] as const;

const POINT_ICONS = [Zap, Smartphone, ShieldCheck, CircleCheck] as const;

export function HowToPayPage() {
  const { t, dict } = useI18n();
  const rows = dict.howToPay.rows.map((row, index) => ({
    ...row,
    tag: WALKTHROUGH_TAGS[index],
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/8 px-3 py-1.5 text-[12.5px] font-semibold text-brand">
          <QrCode size={14} />
          {dict.howToPay.badge}
        </span>
        <h1 className="mt-5 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          {dict.howToPay.title1} <span className="text-sheen">{dict.howToPay.title2}</span>
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-fg-muted">{dict.howToPay.lede}</p>
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <EmvcoInspector payload={SAMPLE_PAYLOAD} />

          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <table className="w-full text-[13.5px]">
              <caption className="border-b border-line bg-surface-2 px-5 py-3 text-left font-display text-[15px] font-semibold">
                {dict.howToPay.walkthrough}
              </caption>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.tag}>
                    <th scope="row" className="w-28 px-5 py-3 text-left align-top">
                      <span className="font-mono text-brand">{row.tag}</span>
                      <span className="mt-0.5 block text-[11px] font-normal text-fg-faint">
                        {t(`common.emvcoTags.${row.tag}` as TranslationKey)}
                      </span>
                    </th>
                    <td className="px-3 py-3 align-top">
                      <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12.5px] break-all">
                        {row.value}
                      </code>
                    </td>
                    <td className="py-3 pr-5 text-fg-muted">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">{dict.howToPay.faqTitle}</h2>
            <div className="mt-4 space-y-3">
              {dict.howToPay.faq.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-line bg-surface px-4 py-3 open:border-brand/30"
                >
                  <summary className="cursor-pointer list-none text-[14.5px] font-semibold marker:hidden">
                    <span className="mr-2 inline-block text-brand transition group-open:rotate-90">
                      ▸
                    </span>
                    {item.q}
                  </summary>
                  <p className="mt-2 pl-6 text-[13.5px] leading-relaxed text-fg-muted">
                    {item.a.replace("{minutes}", String(PAYMENT_WINDOW_SECONDS / 60))}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-line bg-surface p-5">
            <h2 className="mb-3 font-display text-[15px] font-semibold">{dict.howToPay.currentMode}</h2>
            <p className="text-[13px] text-fg-muted">
              {dict.howToPay.provider}{" "}
              <span className="font-semibold text-fg">{paymentProvider}</span>
            </p>
            <p className="mt-1 text-[13px] text-fg-muted">
              {dict.howToPay.apiBase}{" "}
              <span className="font-mono text-[12px] text-fg">{API_BASE || dict.howToPay.notConfigured}</span>
            </p>
          </div>

          {dict.howToPay.points.map((item, index) => {
            const Icon = POINT_ICONS[index] ?? CircleCheck;
            return (
              <div key={item.title} className="rounded-card border border-line bg-surface p-5">
                <Icon size={18} className="text-brand" />
                <p className="mt-2 text-[14px] font-semibold">{item.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{item.body}</p>
              </div>
            );
          })}

          <ButtonLink to="/cart" fullWidth size="lg">
            {dict.howToPay.goToCart}
          </ButtonLink>
        </aside>
      </div>
    </div>
  );
}
