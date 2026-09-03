# KHMart — React + TypeScript + Tailwind storefront with KHQR checkout

A modern e-commerce front end whose checkout page generates a **real EMVCo / KHQR
merchant-presented QR** from the live order total. The shopper scans it with Bakong or any
partner-bank wallet; the storefront never sees card details and only polls for the result.

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
and need almost no `dark:` prefixes. Display type is Space Grotesk, body text is Inter. Motion is
deliberately limited to the cart drawer, mobile nav, payment state changes and the hero.

## Accessibility and responsive behaviour

Skip link, labelled form fields with `aria-describedby` error wiring, `aria-pressed` currency
switch, focus-visible rings, Escape-to-close drawer with scroll lock, semantic tables for the
payload inspector, and a 320 px-to-desktop grid. The QR keeps dark modules on white in both
palettes because inverted codes fail many bank scanners.
