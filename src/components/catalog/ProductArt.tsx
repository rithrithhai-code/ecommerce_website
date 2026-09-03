import {
  Backpack,
  Camera,
  Gamepad,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Smartphone,
  Speaker,
  Watch,
} from "lucide-react";

import { cn } from "@/lib/cn";
import type { GlyphKey, Product } from "@/types";

/**
 * Product artwork.
 *
 * Every card renders from this component: a two-tone mesh derived from `product.hue`
 * with a line-art glyph on top. It needs no network and no binary assets, and if
 * `product.image` is set the layer is replaced by the photograph — so dropping real
 * shots into `public/images` and filling the field in is the only change required.
 */
const GLYPHS = {
  headphones: Headphones,
  speaker: Speaker,
  laptop: Laptop,
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  gamepad: Gamepad,
  smartphone: Smartphone,
  watch: Watch,
  camera: Camera,
  backpack: Backpack,
} satisfies Record<GlyphKey, typeof Headphones>;

export function ProductArt({
  product,
  className,
  glyphClassName,
  eager = false,
  rounded = "rounded-[inherit]",
}: {
  product: Product;
  className?: string;
  glyphClassName?: string;
  eager?: boolean;
  rounded?: string;
}) {
  const [tint, shade] = product.hue;
  const Glyph = GLYPHS[product.glyph];

  if (product.image) {
    return (
      <div className={cn("overflow-hidden bg-surface-2", rounded, className)}>
        <img
          src={product.image}
          alt={product.name}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn("relative isolate overflow-hidden", rounded, className)}
      style={{
        backgroundColor: "var(--surface-2)",
        backgroundImage: `radial-gradient(115% 85% at 18% 8%, ${tint}33, transparent 62%),
           radial-gradient(95% 80% at 92% 96%, ${shade}40, transparent 60%),
           linear-gradient(155deg, ${tint}14, ${shade}26)`,
      }}
    >
      {/* Faint grid keeps the gradient from looking like an empty placeholder. */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `linear-gradient(to right, ${shade}55 1px, transparent 1px),
             linear-gradient(to bottom, ${shade}55 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(70% 70% at 50% 45%, black, transparent 75%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 opacity-70"
        style={{ background: `linear-gradient(to top, ${shade}30, transparent)` }}
        aria-hidden="true"
      />
      <div className="relative flex h-full w-full items-center justify-center">
        <Glyph
          aria-hidden="true"
          strokeWidth={1.15}
          className={cn(
            "size-[46%] -translate-y-[3%] transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-rotate-2",
            glyphClassName,
          )}
          style={{ color: `color-mix(in oklab, ${tint} 58%, var(--fg))` }}
        />
      </div>
      <span className="sr-only">{product.name} product artwork</span>
    </div>
  );
}
