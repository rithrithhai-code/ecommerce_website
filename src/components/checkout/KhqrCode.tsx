import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, Download, LoaderCircle, Printer, QrCode, TriangleAlert } from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Renders an EMVCo payload into a scannable QR.
 *
 * The matrix is generated on the client from the payload string — nothing is fetched
 * from a payment host, so the code works offline and cannot be swapped by a network
 * failure mid-checkout. Colours stay fixed (dark modules on white) because inverting a
 * QR breaks many bank scanners.
 */
export function KhqrCode({
  payload,
  amountLabel,
  merchantName,
  overlay,
  className,
}: {
  payload: string;
  amountLabel: string;
  merchantName: string;
  /** e.g. an expiry veil rendered by the parent. */
  overlay?: ReactNode;
  className?: string;
}) {
  const [rendered, setRendered] = useState<{
    payload: string;
    dataUrl: string | null;
    error: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  // Results belong to a specific payload, so a stale render reads as "still generating"
  // without an extra state-clearing pass inside the effect.
  const current = rendered?.payload === payload ? rendered : null;
  const dataUrl = current?.dataUrl ?? null;
  const error = current?.error ?? null;

  useEffect(() => {
    let active = true;

    const options = {
      errorCorrectionLevel: "M" as const,
      margin: 2,
      width: 640,
      color: { dark: "#0b1013ff", light: "#ffffffff" },
    };

    // The browser encoder can throw synchronously where no 2D canvas context exists,
    // so the call is deferred and both failure shapes arrive through the same rejection
    // path and land in derived state.
    Promise.resolve()
      .then(() => QRCode.toDataURL(payload, options))
      .then((url) => {
        if (active) setRendered({ payload, dataUrl: url, error: null });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setRendered({
          payload,
          dataUrl: null,
          error: cause instanceof Error ? cause.message : "Could not render the QR code",
        });
      });

    return () => {
      active = false;
    };
  }, [payload]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(payload);
      setClipboardError(null);
      setCopied(true);
    } catch {
      setClipboardError("Clipboard access was blocked by the browser");
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative w-full max-w-[320px] rounded-3xl border border-line bg-surface p-4 shadow-glow">
        <div className="flex items-center justify-between gap-2 px-1 pb-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-fg-muted uppercase">
            <QrCode size={14} className="text-brand" />
            KHQR
          </span>
          <span className="text-[12px] font-semibold tabular-nums">{amountLabel}</span>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white p-2">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`KHQR payment code for ${amountLabel}`}
              className="size-full shape-rendering-crisp"
              style={{ imageRendering: "pixelated" }}
            />
          ) : error ? (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-center text-danger">
              <TriangleAlert size={22} />
              <p className="max-w-[16rem] text-[12px] font-medium">{error}</p>
            </div>
          ) : (
            <div className="skeleton flex size-full items-center justify-center rounded-xl">
              <LoaderCircle size={22} className="animate-spin text-fg-faint" />
            </div>
          )}

          {/* Corner reticles: reads as a scan target and matches bank-app framing. */}
          {
            <span aria-hidden="true" className="pointer-events-none absolute inset-3">
              {["top-0 left-0 border-t-2 border-l-2 rounded-tl-xl",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl"].map((position) => (
                <span
                  key={position}
                  className={cn("absolute size-7 border-brand/70", position)}
                />
              ))}
            </span>
          }

          {overlay}
        </div>

        <p className="px-1 pt-3 text-center text-[11.5px] text-fg-faint">
          Pay <span className="font-semibold text-fg-muted">{merchantName}</span> · amount is locked
          into the code
        </p>
      </div>

      <div className="no-print flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={copyPayload}>
          {copied ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
          {copied ? "Payload copied" : "Copy payload"}
        </Button>
        {dataUrl ? (
          <>
            <a
              href={dataUrl}
              download={`KHQR-${amountLabel.replace(/[^\w]/g, "")}.png`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 text-[13px] font-medium transition hover:bg-surface-2"
            >
              <Download size={14} />
              Save PNG
            </a>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Printer size={14} />
              Print
            </Button>
          </>
        ) : null}
      </div>

      {clipboardError ? (
        <p className="text-[12px] font-medium text-danger" role="alert">
          {clipboardError}
        </p>
      ) : null}
    </div>
  );
}
