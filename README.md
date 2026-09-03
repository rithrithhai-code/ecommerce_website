# JingHUB Express — React + TypeScript + Tailwind storefront with KHQR checkout

A modern e-commerce front end whose checkout page generates a **real EMVCo / KHQR
merchant-presented QR** from the live order total. The shopper scans it with Bakong or any
partner-bank wallet; the storefront never sees card details and only polls for the result.
The brand palette is red in both themes, defined once in `src/index.css`.

Built with Vite 8, React 19, TypeScript (strict), Tailwind CSS v4, Zustand, Framer Motion
(`motion`), React Router 7 and Vitest.

```
npm install
npm run dev        # http://localhost:5173
```

## What is actually implemented

| Area | Detail |
| --- | --- |
| Storefront | Home, catalogue with URL-driven filters, product detail, cart, checkout, receipt, order history, 404 |
| Cart | Zustand store persisted to local storage, stock clamping, slide-over drawer, free-delivery progress |
| Money | Prices held in USD, displayed in USD or KHR, 10% GST, promo codes, three delivery methods |
| Checkout | Address validation, delivery + promo selection, then a KHQR panel with countdown and status polling |
| Payment | EMVCo TLV payload built and CRC-16 checked in `src/lib/emvco.ts`, rendered locally with `qrcode` |
| Languages | English + Khmer, compile-checked dictionary, persisted `<html lang>`, Khmer font stack |
| Quality | 14 unit tests on the payload builder, `tsc -b` strict, `oxlint`, route-level code splitting |

Try a promo code: `KHQR10` (10% over $100), `SAKOR5` ($5 off), `FREESHIP`.

## Running the flow end to end

1. Add products, open the cart, choose **Checkout**.
2. Fill the delivery block (validation is inline), pick a delivery method, apply a promo.
3. Press **Generate KHQR**. Checkout encodes the total into EMVCo field 54 and renders the matrix —
   with the sandbox provider the order auto-settles after ~12–26 seconds, or press
   **Simulate payer confirming** to settle it immediately.
4. On settlement the cart clears and the receipt page opens at `/order/:billReference`.
5. Expand **Payload inspector** on the payment or receipt screen to read every tag and re-verify
   the checksum. That panel is the fastest way to debug a merchant profile.

## Languages

English and Khmer (ខ្មែរ) ship in the box, with a toggle in the header beside the currency
switch. The choice is persisted and applied to `<html lang>` before paint, which is what loads
the Khmer font stack (Kantumruy Pro) and tells a screen reader which voice to use.

- `src/i18n/en.ts` is the dictionary. `km.ts` is typed against it, so a missing translation is a
  build error rather than a page that silently falls back mid-sentence.
- `t()` only accepts dot-paths that exist (`"hero.ctaShop"`), with `{name}` interpolation.
- Lists and tables read the structured dictionary (`dict.how.steps`, `dict.product.viewLabels`).
- Product copy is overridden per field in `src/data/products.km.ts`; anything absent falls back to
  English, so translating one product is enough to ship it. Product names stay Latin on purpose —
  that is how shoppers type them into search.
- Data modules never hold prose: shipping, promo and validation messages are stored as keys and
  resolved in the UI, so `src/lib/pricing.ts` and the stores stay locale-free.
- Dates follow the locale (`km-KH` renders Khmer month names); amounts keep en-US grouping, which
  is what Cambodian price tags use.

## Connecting a real payment service

`src/api/payment.ts` is the only module that talks to a payment backend. Set the base URL and the
same three functions switch from the in-memory simulator to HTTP:

```
# .env.local
VITE_PAYMENT_API_BASE=https://api.your-host.example/v1
```

It expects:

```
POST {base}/payment-intents
  body      { billNumber, amount, currency, qrPayload, expiresIn }
  response  { expiresAt?, qrPayload? }

GET  {base}/payment-intents/:billNumber/status
  response  { status: "awaiting_payment" | "paid" | "failed" | "expired", paidAt?, method?, providerRef? }
```

When the variable is set, the sandbox controls disappear from checkout, and a failed lookup keeps
the QR alive instead of breaking the page.

## What is real and what is simulated

Real: the TLV construction, tag lengths, ASCII folding of merchant names, the CRC-16/CCITT-FALSE
checksum (verified against the `123456789 → 29B1` reference vector), QR generation, the
countdown/polling state machine, and the order maths.

Simulated: settlement. The proxy id in `src/data/merchant.ts` is a placeholder, so a live bank app
will decode the code and report an unknown merchant rather than paying it. Conversion uses an
indicative 4,100 KHR rate.

Before production, confirm with your acquirer:

- which merchant-account-information tag and sub-tags your KHQR version expects (this build uses
  `51` with `00` proxy + `01` merchant, and exposes `extraTemplates` / `accountInfoTag` overrides
  so you can adapt without editing the builder)
- that the amount exponent matches what the acquirer parses for KHR
- server-side verification, idempotent intent creation and a webhook receiver — never trust a
  browser-side "paid" result to decide fulfilment
- storing prices as integer minor units instead of floats

## Project layout

```
src/
  api/payment.ts        sandbox ⇄ live payment adapter
  components/
    catalog/            ProductArt (vector art), ProductCard, ProductGrid
    cart/               CartDrawer
    checkout/           KhqrCode, PaymentPanel, EmvcoInspector, OrderSummaryPanel,
                        ShippingPicker, PromoField, CustomerForm
    layout/ ui/         header, footer, shell, buttons, fields, badges, stars
  data/products.ts      12 products, categories, lookups
  hooks/                useCartView, usePaymentSession (QR lifecycle + polling)
  lib/                  emvco.ts (+ tests), pricing.ts, format.ts, order.ts, styles.ts
  pages/                Home, Shop, Product, Cart, Checkout, OrderConfirmation, Orders, HowToPay
  store/                cart, orders, checkout draft, preferences
```

## Product images

Product art renders from a per-product two-tone gradient plus a line glyph, so the app needs no
binary assets and works offline. To use real photography, drop files in `public/images/` and set
`image: "/images/aura-one.jpg"` on a product — `ProductArt` switches to the photograph and every
card, drawer row and detail page follows automatically.

## Scripts

```
npm run dev         Vite dev server
npm run build       typecheck + production build to dist/
npm run preview     serve the production build
npm run typecheck   tsc -b only
npm run lint        oxlint
npm test            vitest run
```

## Design system notes

Colours, radii and fonts are CSS variables in `src/index.css` under Tailwind v4's `@theme inline`,
which is why `bg-surface`, `text-fg-muted` and `border-line` flip palettes with the `.dark` class
and need almost no `dark:` prefixes. JingHUB Express is red in both themes: `--brand`,
`--brand-strong` (hover) and `--brand-contrast` (ink or near-white, depending on which side of the
fill it sits on) are set once per palette, and every tint, ring and gradient derives from them —
including `text-sheen`, which gradients brand into `--gold`. Display type is Space Grotesk, body
text is Inter. Motion is deliberately limited to scroll reveals, the cart drawer, the QR scan beam
and the hero, and all of it falls back to static rendering under `prefers-reduced-motion`.

Renaming the brand later touches `src/data/merchant.ts` (the merchant name encoded in the QR),
the wordmark in `src/components/ui/Logo.tsx`, and the persisted state keys in `src/store/*`
(`jinghub.cart`, `jinghub.orders`, `jinghub.preferences`, `jinghub.checkout`) plus the matching
`localStorage.getItem` call in `index.html` — changing those keys drops existing demo carts.

## Accessibility and responsive behaviour

Skip link, labelled form fields with `aria-describedby` error wiring, `aria-pressed` currency
switch, focus-visible rings, Escape-to-close drawer with scroll lock, semantic tables for the
payload inspector, and a 320 px-to-desktop grid. The QR keeps dark modules on white in both
palettes because inverted codes fail many bank scanners.
