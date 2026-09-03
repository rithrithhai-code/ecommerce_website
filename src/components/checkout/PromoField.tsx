import { useState } from "react";
import { BadgePercent, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { PROMOS, findPromo, promoRejection } from "@/lib/pricing";
import { cn } from "@/lib/cn";
import { useCheckoutDraft } from "@/store/checkout";

/** Promo entry. Validation mirrors `computeTotals`, so an accepted code always applies. */
export function PromoField({ subtotalUsd }: { subtotalUsd: number }) {
  const [entry, setEntry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const promoCode = useCheckoutDraft((state) => state.promoCode);
  const setPromoCode = useCheckoutDraft((state) => state.setPromoCode);
  const applied = findPromo(promoCode);

  if (applied) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand/35 bg-brand/8 px-3.5 py-3">
        <BadgePercent size={16} className="shrink-0 text-brand" />
        <p className="min-w-0 flex-1 text-[13px]">
          <span className="font-semibold text-brand">{applied.code}</span>{" "}
          <span className="text-fg-muted">· {applied.label}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setPromoCode(null);
            setEntry("");
            setError(null);
          }}
          aria-label={`Remove promo ${applied.code}`}
          className="text-fg-faint transition hover:text-danger"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  function apply(code: string) {
    const rejection = promoRejection(code, subtotalUsd);
    if (rejection) {
      setError(rejection);
      return;
    }
    setError(null);
    setPromoCode(code.trim().toUpperCase());
    setEntry("");
  }

  return (
    <div className="space-y-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply(entry);
        }}
        className="flex gap-2"
      >
        <input
          value={entry}
          onChange={(event) => {
            setEntry(event.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Promo code"
          aria-label="Promo code"
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-2xl border bg-surface-2 px-3.5 text-sm uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal placeholder:text-fg-faint focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10",
            error ? "border-danger" : "border-line focus:border-brand",
          )}
        />
        <Button type="submit" variant="outline" disabled={!entry.trim()}>
          Apply
        </Button>
      </form>

      {error ? (
        <p className="text-[12px] font-medium text-danger" role="alert">
          {error}
        </p>
      ) : (
        <p className="flex flex-wrap items-center gap-1.5 text-[12px] text-fg-faint">
          Try
          {PROMOS.map((promo) => (
            <button
              key={promo.code}
              type="button"
              onClick={() => apply(promo.code)}
              className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-fg-muted transition hover:border-brand hover:text-brand"
            >
              {promo.code}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}
