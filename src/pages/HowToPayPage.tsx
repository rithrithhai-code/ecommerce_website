import { CircleCheck, QrCode, ShieldCheck, Smartphone, Zap } from "lucide-react";

import { EmvcoInspector } from "@/components/checkout/EmvcoInspector";
import { ButtonLink } from "@/components/ui/Button";
import { API_BASE, paymentProvider } from "@/api/payment";
import { MERCHANT } from "@/data/merchant";
import { TagNames, buildKhqrPayload } from "@/lib/emvco";
import { PAYMENT_WINDOW_SECONDS } from "@/lib/order";

const SAMPLE_PAYLOAD = buildKhqrPayload({
  merchant: MERCHANT,
  currency: "USD",
  amount: 348.6,
  billNumber: "KH20260903DEMO01",
});

const TAG_WALKTHROUGH = [
  {
    tag: "00",
    value: "01",
    why: "Payload format indicator. Tells the wallet this is an EMVCo MPM code, not a random string.",
  },
  {
    tag: "01",
    value: "12",
    why: "Point of initialization. 12 means dynamic: the amount is fixed and the code expires.",
  },
  {
    tag: "51",
    value: "merchant account info",
    why: "Where the Bakong proxy identifier lives. This is the field your acquirer issues.",
  },
  {
    tag: "52",
    value: MERCHANT.mcc,
    why: "Merchant category code — 5732 is Electronics Sale, and it affects interchange.",
  },
  {
    tag: "53",
    value: "840 / 116",
    why: "ISO-4217 numeric currency. 840 is USD, 116 is KHR.",
  },
  {
    tag: "54",
    value: "348.60",
    why: "The order total. Because it is inside the code, the payer confirms instead of typing.",
  },
  {
    tag: "62",
    value: "bill number",
    why: "Sub-tag 01 carries the reference, which is how the settlement notice finds the order.",
  },
  {
    tag: "63",
    value: "CRC-16",
    why: "Checksum over the whole string. Flip one digit and every compliant scanner rejects it.",
  },
];

const FAQ = [
  {
    q: "Does the shopper need a Bakong account?",
    a: "They need a KHQR-capable wallet, which Bakong and the partner-bank apps all are. Any app that decodes EMVCo MPM will show the merchant name and the locked amount.",
  },
  {
    q: "What happens if the QR expires mid-payment?",
    a: `The storefront stops polling at ${PAYMENT_WINDOW_SECONDS / 60} minutes and offers a fresh code with a new bill reference. Money that did land against the old reference is still matched by the acquirer's own report.`,
  },
  {
    q: "Why is no card data collected?",
    a: "Because there is nowhere for it to leak. The authorisation happens inside the bank app; this storefront only ever learns the outcome of a status lookup.",
  },
  {
    q: "How would I connect a real payment service?",
    a: "Set VITE_PAYMENT_API_BASE. The three functions in src/api/payment.ts switch from the in-memory simulator to POST /payment-intents and GET /payment-intents/:billNumber/status, and the sandbox controls disappear from checkout.",
  },
];

export function HowToPayPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/8 px-3 py-1.5 text-[12.5px] font-semibold text-brand">
          <QrCode size={14} />
          Payment architecture
        </span>
        <h1 className="mt-5 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          The QR is the integration
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-fg-muted">
          Checkout does not redirect, and it does not touch a card network. It assembles an EMVCo
          Merchant-Presented payload in the browser, renders it with the <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[14px]">qrcode</code>{" "}
          encoder, then polls for the settlement result. Below is a real payload this page built —
          open the inspector and you can read every tag.
        </p>
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <EmvcoInspector payload={SAMPLE_PAYLOAD} />

          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <table className="w-full text-[13.5px]">
              <caption className="border-b border-line bg-surface-2 px-5 py-3 text-left font-display text-[15px] font-semibold">
                What each field is doing
              </caption>
              <tbody className="divide-y divide-line">
                {TAG_WALKTHROUGH.map((row) => (
                  <tr key={row.tag}>
                    <th scope="row" className="w-24 px-5 py-3 text-left align-top">
                      <span className="font-mono text-brand">{row.tag}</span>
                      <span className="mt-0.5 block text-[11px] font-normal text-fg-faint">
                        {TagNames[row.tag]}
                      </span>
                    </th>
                    <td className="px-3 py-3 align-top">
                      <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12.5px]">
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
            <h2 className="font-display text-xl font-semibold tracking-tight">Questions buyers ask</h2>
            <div className="mt-4 space-y-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-line bg-surface px-4 py-3 open:border-brand/30"
                >
                  <summary className="cursor-pointer list-none text-[14.5px] font-semibold marker:hidden">
                    <span className="mr-2 text-brand transition group-open:rotate-90 inline-block">
                      ▸
                    </span>
                    {item.q}
                  </summary>
                  <p className="mt-2 pl-6 text-[13.5px] leading-relaxed text-fg-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-line bg-surface p-5">
            <h2 className="mb-3 font-display text-[15px] font-semibold">Current mode</h2>
            <p className="text-[13px] text-fg-muted">
              Provider:{" "}
              <span className="font-semibold text-fg">{paymentProvider}</span>
            </p>
            <p className="mt-1 text-[13px] text-fg-muted">
              API base:{" "}
              <span className="font-mono text-[12px] text-fg">{API_BASE || "not configured"}</span>
            </p>
          </div>

          {[
            {
              icon: Zap,
              title: "Settles without a redirect",
              body: "The shopper stays on the confirmation tab, which is why a lost payment page stops being a lost sale.",
            },
            {
              icon: Smartphone,
              title: "Any KHQR wallet works",
              body: "The payload is standard EMVCo, so a bank app that is not Bakong still reads it.",
            },
            {
              icon: ShieldCheck,
              title: "Amount cannot be mistyped",
              body: "Field 54 fixes the number. A tampered code fails its CRC before any wallet tries to pay it.",
            },
            {
              icon: CircleCheck,
              title: "Reference closes the loop",
              body: "The bill number in tag 62.01 is the join key between this order and the acquirer's settlement report.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-card border border-line bg-surface p-5">
              <item.icon size={18} className="text-brand" />
              <p className="mt-2 text-[14px] font-semibold">{item.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{item.body}</p>
            </div>
          ))}

          <ButtonLink to="/cart" fullWidth size="lg">
            Go to cart
          </ButtonLink>
        </aside>
      </div>
    </div>
  );
}
