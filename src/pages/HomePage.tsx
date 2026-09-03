import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Fingerprint,
  Lock,
  QrCode,
  RotateCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ProductArt } from "@/components/catalog/ProductArt";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";
import { useSpotlight } from "@/hooks/useSpotlight";
import { CATEGORIES, PRODUCTS, getFeatured } from "@/data/products";
import { MERCHANT } from "@/data/merchant";
import { PAYMENT_WINDOW_SECONDS } from "@/lib/order";
import { buildKhqrPayload, crc16CcittFalse } from "@/lib/emvco";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/store/preferences";

const VALUES = [
  { icon: Truck, title: "Free over $150", body: "Standard delivery across Phnom Penh" },
  { icon: RotateCw, title: "15-day returns", body: "Unopened boxes, no restocking fee" },
  { icon: ShieldCheck, title: "Local warranty", body: "12–36 months, serviced in BKK1" },
  { icon: BadgeCheck, title: "Tax invoices", body: "E-invoice issued with every order" },
];

const PARTNERS = [
  "Bakong",
  "ABA Bank",
  "ACLEDA",
  "Canadia Bank",
  "wing",
  "TrueMoney",
  "Pi Pay",
  "SIAB",
];

const QUOTES = [
  {
    quote:
      "We switched our counter to KHQR last quarter. The amount in the code means nobody keys in a total twice, so the queue moves visibly faster.",
    name: "Laksmi Rith",
    role: "Owner, BKK1 electronics shop",
    rating: 5,
  },
  {
    quote:
      "Ordered a keyboard at 21:04, scanned with my bank app, and had a receipt before I closed the laptop. The reference number matched instantly.",
    name: "Chanphaek Tron",
    role: "Buyer, Siem Reap",
    rating: 4.5,
  },
  {
    quote:
      "As a developer I checked the payload before paying. Real EMVCo tags and a correct CRC — most demo checkouts fake that part.",
    name: "Phearith S.",
    role: "Software engineer",
    rating: 5,
  },
];

/** A genuine, decodable payload used only to render the hero QR visual. */
const HERO_PAYLOAD = buildKhqrPayload({
  merchant: MERCHANT,
  currency: "USD",
  amount: 129,
  billNumber: "HERODEMO01",
  pointOfInitialization: "11",
});

const HERO_CRC = crc16CcittFalse(`${HERO_PAYLOAD.slice(0, HERO_PAYLOAD.lastIndexOf("6304") + 4)}`);

export function HomePage() {
  const featured = getFeatured(8);
  const currency = usePreferences((state) => state.currency);
  const onCardMove = useSpotlight();
  const peekA = PRODUCTS[2];
  const peekB = PRODUCTS[4];

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="grain relative overflow-hidden">
        {/* Drifting brand blobs give the page depth instead of a flat fill. */}
        <div
          aria-hidden="true"
          className="animate-drift pointer-events-none absolute -top-32 -left-24 size-[34rem] rounded-full bg-brand/18 blur-[90px]"
        />
        <div
          aria-hidden="true"
          className="animate-drift pointer-events-none absolute -right-16 top-24 size-[26rem] rounded-full bg-gold/14 blur-[80px] [animation-delay:-6s] [animation-duration:22s]"
        />

        <div className="mx-auto grid max-w-[88rem] items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/8 px-3 py-1.5 text-[12.5px] font-semibold text-brand">
              <span className="size-1.5 animate-blink rounded-full bg-brand" aria-hidden="true" />
              KHQR &amp; Bakong checkout built in
            </span>

            <h1 className="mt-6 font-display text-[clamp(2.75rem,6.5vw,4.75rem)] leading-[0.95] font-semibold tracking-tight text-balance">
              Scan once.
              <br />
              Pay. <span className="text-sheen">Done.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted">
              A full storefront in React, TypeScript and Tailwind — catalogue, cart, and a checkout
              that encodes your order total into a real EMVCo QR. No card forms, no redirect, no
              amount typed by hand.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink to="/shop" size="lg" className="shadow-glow">
                Shop the catalogue
                <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink to="/how-to-pay" size="lg" variant="outline">
                <QrCode size={16} />
                How the QR works
              </ButtonLink>
            </div>

            <dl className="mt-11 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {[
                { value: `${PAYMENT_WINDOW_SECONDS / 60} min`, label: "per generated code" },
                { value: "0", label: "card details stored" },
                { value: `${PARTNERS.length}`, label: "wallets accepted" },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface px-4 py-4">
                  <dt className="font-display text-[26px] leading-none font-semibold tabular-nums">
                    {stat.value}
                  </dt>
                  <dd className="mt-1.5 text-[12px] leading-snug text-fg-faint">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Phone mockup running the payment screen, with catalogue tiles peeking out. */}
          <div className="relative mx-auto w-full max-w-[420px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 m-auto size-[22rem] rounded-full bg-brand/22 blur-[70px]"
            />

            <div className="relative">
              <Link
                to={`/product/${peekA.slug}`}
                onMouseMove={onCardMove}
                className="spotlight group absolute -left-6 -top-8 z-20 hidden w-36 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift transition duration-500 hover:-translate-y-1.5 sm:block lg:-left-14"
              >
                <ProductArt product={peekA} className="aspect-[5/4] w-full" rounded="rounded-none" eager />
                <span className="relative z-3 block truncate bg-canvas/90 px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur">
                  {peekA.name}
                </span>
              </Link>

              <Link
                to={`/product/${peekB.slug}`}
                onMouseMove={onCardMove}
                className="spotlight group absolute -right-5 -bottom-9 z-20 hidden w-36 rotate-[5deg] overflow-hidden rounded-2xl border border-line bg-surface shadow-lift transition duration-500 hover:rotate-0 hover:-translate-y-1.5 sm:block lg:-right-12"
              >
                <ProductArt product={peekB} className="aspect-[5/4] w-full" rounded="rounded-none" eager />
                <span className="relative z-3 block truncate bg-canvas/90 px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur">
                  {peekB.name}
                </span>
              </Link>

              {/* Device */}
              <div className="relative mx-auto w-[292px] sm:w-[318px]">
                <div className="rounded-[2.9rem] border border-line-strong bg-fg p-2.5 shadow-lift">
                  <div className="grain relative overflow-hidden rounded-[2.35rem] bg-canvas">
                    <div className="bg-aurora absolute inset-0 opacity-70" aria-hidden="true" />

                    <div className="relative px-5 pt-5 pb-6">
                      <span
                        aria-hidden="true"
                        className="mx-auto mb-5 block h-1.5 w-20 rounded-full bg-line-strong"
                      />

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-fg-faint uppercase">
                          <Smartphone size={12} className="text-brand" />
                          Scan to pay
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/12 px-2 py-1 text-[10px] font-bold tracking-wide text-brand uppercase">
                          <span className="size-1.5 animate-blink rounded-full bg-brand" />
                          live
                        </span>
                      </div>

                      <div className="relative mt-4 overflow-hidden rounded-2xl bg-white p-3 shadow-soft">
                        <HeroQrMatrix payload={HERO_PAYLOAD} />
                        <span
                          aria-hidden="true"
                          className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-brand/35 to-transparent"
                        />
                        <span aria-hidden="true" className="pointer-events-none absolute inset-2">
                          {[
                            "top-0 left-0 border-t-2 border-l-2 rounded-tl-xl",
                            "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
                            "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl",
                            "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl",
                          ].map((position) => (
                            <span
                              key={position}
                              className={cn("absolute size-6 border-brand", position)}
                            />
                          ))}
                        </span>
                      </div>

                      <p className="mt-4 text-center font-display text-3xl font-semibold tracking-tight tabular-nums">
                        {formatMoney(129, currency)}
                      </p>
                      <p className="mt-1 text-center text-[11.5px] text-fg-faint">
                        {MERCHANT.name} · amount locked in field 54
                      </p>

                      <div className="mt-5 space-y-2">
                        <div className="flex h-11 items-center justify-center gap-2 rounded-full bg-brand text-[13.5px] font-semibold text-brand-contrast shadow-soft">
                          <Fingerprint size={16} />
                          Confirm &amp; pay
                        </div>
                        <p className="flex items-center justify-center gap-1.5 text-[10.5px] text-fg-faint">
                          <Lock size={11} />
                          Nothing is charged until you approve in the bank app
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating telemetry pills around the device. */}
                <div className="animate-float glass absolute -left-8 top-[28%] hidden rounded-2xl border border-line px-3 py-2 shadow-lift md:block">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-fg-faint uppercase">
                    EMVCo MPM
                  </p>
                  <p className="mt-0.5 font-mono text-[12px] font-semibold">tag 54 · 129.00</p>
                </div>

                <div
                  className="animate-float glass absolute -right-10 bottom-[22%] hidden rounded-2xl border border-line px-3 py-2 shadow-lift md:block [animation-delay:-4.5s]"
                  style={{ animationDuration: "11s" }}
                >
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-fg-faint uppercase">
                    <BadgeCheck size={12} className="text-brand" />
                    checksum
                  </p>
                  <p className="mt-0.5 font-mono text-[12px] font-semibold">{HERO_CRC} · valid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partner marquee ──────────────────────────────────────────────── */}
      <section className="border-y border-line bg-surface/70 py-5">
        <div className="mx-auto flex max-w-[88rem] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <p className="hidden shrink-0 text-[11.5px] font-semibold tracking-[0.16em] text-fg-faint uppercase sm:block">
            Accepted by
          </p>
          <div className="edge-fade relative flex-1 overflow-hidden">
            <div className="animate-marquee flex w-max items-center gap-12 pr-12">
              {[...PARTNERS, ...PARTNERS].map((partner, index) => (
                <span
                  key={`${partner}-${index}`}
                  className="font-display text-[19px] font-semibold tracking-tight text-fg-faint transition hover:text-fg"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6 lg:px-8">
        <RevealGroup
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          step={0.06}
        >
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="hairline-top group relative flex items-start gap-3 overflow-hidden rounded-card border border-line bg-surface p-5 transition hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/22 to-gold/16 text-brand">
                <value.icon size={18} />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold">{value.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-fg-muted">{value.body}</p>
              </div>
            </div>
          ))}
        </RevealGroup>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11.5px] font-semibold tracking-[0.18em] text-brand uppercase">
              Catalogue
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Browse by category
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-[13.5px] font-medium text-brand transition hover:gap-2.5"
          >
            All products <ArrowRight size={15} />
          </Link>
        </Reveal>

        <RevealGroup className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" step={0.08}>
          {CATEGORIES.map((category) => {
            const products = PRODUCTS.filter((product) => product.category === category.id);
            const cover = products[0] ?? PRODUCTS[0];
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                onMouseMove={onCardMove}
                className="spotlight group relative overflow-hidden rounded-card border border-line bg-surface transition duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <ProductArt
                  product={cover}
                  className="aspect-[4/3] w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  rounded="rounded-none"
                />
                <div className="relative z-3 space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-[15px] font-semibold">{category.label}</p>
                    <span className="rounded-full bg-surface-3/90 px-2 py-0.5 text-[11px] font-semibold text-fg-muted tabular-nums backdrop-blur">
                      {products.length}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-fg-muted">{category.blurb}</p>
                  <p className="flex items-center gap-1 pt-1 text-[12px] font-medium text-brand opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Shop now <ArrowRight size={13} />
                  </p>
                </div>
              </Link>
            );
          })}
        </RevealGroup>
      </section>

      {/* ─── Featured ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11.5px] font-semibold tracking-[0.18em] text-gold uppercase">
              Live from the catalogue
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Moving fastest this week
            </h2>
          </div>
          <span className="hidden items-center gap-1.5 text-[12.5px] text-fg-faint sm:inline-flex">
            <Sparkles size={13} className="text-gold" />
            Ranked by rating
          </span>
        </Reveal>
        <div className="mt-8">
          <ProductGrid products={featured} columns="default" />
        </div>
      </section>

      {/* ─── How payment works ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-card border border-line bg-surface">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-16 size-72 rounded-full bg-brand/14 blur-3xl"
            />
            <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
              <div>
                <p className="text-[11.5px] font-semibold tracking-[0.18em] text-brand uppercase">
                  Payment architecture
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Checkout, in four steps
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
                  JingHUB Express builds an EMVCo Merchant-Presented payload — merchant account info, MCC,
                  currency, the exact order total, and a CRC-16 checksum — then renders it locally.
                  Your bank app does the authorisation; the storefront only polls for the result.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink to="/how-to-pay" variant="outline">
                    Read the payment flow
                    <ArrowRight size={16} />
                  </ButtonLink>
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3.5 text-[12.5px] font-medium text-fg-muted">
                    <Banknote size={14} className="text-brand" />
                    Settlement in-app, no redirect
                  </span>
                </div>
              </div>

              <ol className="relative space-y-3">
                {/* Connector line behind the step markers. */}
                <span
                  aria-hidden="true"
                  className="absolute top-6 bottom-6 left-[1.65rem] w-px bg-gradient-to-b from-brand/45 via-line to-transparent"
                />
                {[
                  {
                    icon: QrCode,
                    title: "Order total becomes the payload",
                    body: "Subtotal, discount, delivery and GST collapse into one field 54 amount.",
                  },
                  {
                    icon: Smartphone,
                    title: "Scan in any KHQR-capable app",
                    body: "Bakong and partner bank wallets read the same EMVCo tags.",
                  },
                  {
                    icon: Banknote,
                    title: "Amount arrives pre-filled",
                    body: "The payer confirms rather than types, which removes the miskey risk.",
                  },
                  {
                    icon: BadgeCheck,
                    title: "Bill reference closes the loop",
                    body: "Tag 62.01 matches the settlement notice back to this exact order.",
                  },
                ].map((step, index) => (
                  <li
                    key={step.title}
                    className="relative flex gap-4 rounded-2xl border border-line bg-surface-2/60 p-4 transition hover:border-brand/35 hover:bg-surface-2"
                  >
                    <span className="z-3 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-strong text-brand-contrast shadow-soft">
                      <step.icon size={18} />
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold">
                        <span className="mr-2 font-mono text-[11.5px] text-fg-faint">
                          0{index + 1}
                        </span>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-snug text-fg-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Quotes ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            What early shoppers said
          </h2>
        </Reveal>
        <RevealGroup className="mt-8 grid gap-4 lg:grid-cols-3" step={0.1}>
          {QUOTES.map((item) => (
            <figure
              key={item.name}
              onMouseMove={onCardMove}
              className="spotlight hairline-top relative flex flex-col gap-4 overflow-hidden rounded-card border border-line bg-surface p-6 transition hover:-translate-y-1 hover:shadow-soft"
            >
              <Stars rating={item.rating} size={13} />
              <blockquote className="relative z-3 text-[14.5px] leading-relaxed text-fg-muted">
                “{item.quote}”
              </blockquote>
              <figcaption className="relative z-3 mt-auto flex items-center gap-3 border-t border-line pt-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-brand/25 to-gold/20 font-display text-[13px] font-bold text-brand">
                  {item.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold">{item.name}</span>
                  <span className="block text-[12px] text-fg-faint">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </RevealGroup>
      </section>

      {/* ─── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-4 pb-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="bg-aurora grain relative overflow-hidden rounded-card border border-line px-8 py-14 text-center sm:px-12">
            <div
              aria-hidden="true"
              className="animate-drift pointer-events-none absolute -bottom-24 left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-brand/16 blur-[80px]"
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-[12px] font-semibold text-brand">
                <QrCode size={13} />
                Ready when you are
              </span>
              <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
                Put a basket together and watch the total become a{" "}
                <span className="text-sheen">scannable code</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] text-fg-muted">
                Everything runs client-side in this build — filters, cart maths, payload, checksum
                and receipt — so you can trace a dollar from the catalogue tile to field 54.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink to="/shop" size="lg" className="shadow-glow">
                  Start a basket
                  <ArrowRight size={17} />
                </ButtonLink>
                <ButtonLink to="/how-to-pay" size="lg" variant="ghost">
                  Inspect a sample payload
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/**
 * Small static matrix used only as the hero visual. The checkout QR is generated with the
 * `qrcode` renderer; this one is hand-drawn from the payload so the landing page has no canvas
 * work to do while it is still animating in.
 */
function HeroQrMatrix({ payload }: { payload: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  for (let i = 0; i < size * size; i += 1) {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    hash = hash >>> 0;
    cells.push((hash & 0b1000) !== 0);
  }

  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#0b1013" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0b1013" />
    </g>
  );

  const reserved = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-[150px]"
      role="img"
      aria-label="Illustrative KHQR code"
      shapeRendering="crispEdges"
    >
      {cells.map((on, index) => {
        const x = index % size;
        const y = Math.floor(index / size);
        if (reserved(x, y) || !on) return null;
        return <rect key={index} x={x} y={y} width="1" height="1" fill="#0b1013" />;
      })}
      {finder(0, 0)}
      {finder(size - 7, 0)}
      {finder(0, size - 7)}
    </svg>
  );
}
