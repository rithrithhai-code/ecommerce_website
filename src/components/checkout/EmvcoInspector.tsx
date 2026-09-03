import { Fragment, useMemo, useState } from "react";
import { BadgeCheck, ChevronDown, CircleAlert, ScanLine } from "lucide-react";

import { cn } from "@/lib/cn";
import { decodeKhqrPayload } from "@/lib/emvco";

/**
 * Decodes the payload that was just encoded and re-computes its CRC.
 *
 * This is a developer affordance, not shopper UI: when a bank app rejects a code, the
 * tag table tells you in seconds whether a merchant field is too long or a sub-tag is
 * missing, instead of guessing against the QR image.
 */
export function EmvcoInspector({ payload, className }: { payload: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const decoded = useMemo(() => decodeKhqrPayload(payload), [payload]);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-surface-2/60", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <ScanLine size={16} className="shrink-0 text-brand" />
        <span className="flex-1 text-[13px] font-semibold">Payload inspector</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            decoded.checksumValid
              ? "bg-brand/12 text-brand"
              : "bg-danger/12 text-danger",
          )}
        >
          {decoded.checksumValid ? <BadgeCheck size={12} /> : <CircleAlert size={12} />}
          CRC {decoded.checksumValid ? "valid" : "invalid"}
        </span>
        <ChevronDown
          size={15}
          className={cn("text-fg-faint transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="border-t border-line px-4 py-3">
          <p className="mb-3 text-[12px] text-fg-muted">
            {payload.length} characters · {decoded.tags.length} top-level tags · checksum{" "}
            <code className="rounded bg-surface px-1 py-0.5 text-[11px]">
              {decoded.actualChecksum || decoded.expectedChecksum}
            </code>
          </p>

          <table className="w-full text-[12px]">
            <thead className="text-fg-faint">
              <tr className="text-left">
                <th className="py-1 pr-2 font-medium">Tag</th>
                <th className="py-1 pr-2 font-medium">Field</th>
                <th className="py-1 pr-2 font-medium">Len</th>
                <th className="py-1 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {decoded.tags.map((tag) => (
                <Fragment key={tag.id}>
                  <tr className="border-t border-line/70">
                    <td className="py-1.5 pr-2 font-mono text-brand">{tag.id}</td>
                    <td className="py-1.5 pr-2 text-fg-muted">{tag.name}</td>
                    <td className="py-1.5 pr-2 tabular-nums text-fg-faint">{tag.length}</td>
                    <td className="max-w-[16rem] py-1.5 font-mono break-all">
                      {tag.id === "63" ? tag.value.toUpperCase() : tag.value}
                    </td>
                  </tr>
                  {tag.nested.map((sub) => (
                    <tr key={`${tag.id}-${sub.id}`} className="border-t border-line/40 bg-surface/40">
                      <td className="py-1.5 pr-2 pl-4 font-mono text-fg-faint">
                        └ {sub.id}
                      </td>
                      <td className="py-1.5 pr-2 text-fg-faint">{sub.name}</td>
                      <td className="py-1.5 pr-2 tabular-nums text-fg-faint">{sub.length}</td>
                      <td className="max-w-[16rem] py-1.5 pl-4 font-mono break-all">{sub.value}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>

          {decoded.errors.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[12px] text-danger">
              {decoded.errors.map((message) => (
                <li key={message}>· {message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
