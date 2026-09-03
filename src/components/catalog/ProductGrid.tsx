import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types";

export function ProductGrid({
  products,
  className,
  eager = false,
  columns = "default",
}: {
  products: Product[];
  className?: string;
  eager?: boolean;
  columns?: "default" | "wide";
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        columns === "wide" ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} eager={eager && index < 4} />
      ))}
    </div>
  );
}

/** Placeholder cards that match the real card's footprint, used while filtering. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="skeleton aspect-[4/5] w-full" />
          <div className="space-y-2.5 p-4">
            <div className="skeleton h-2.5 w-16 rounded-full" />
            <div className="skeleton h-4 w-3/4 rounded-lg" />
            <div className="skeleton h-3 w-2/3 rounded-lg" />
            <div className="flex items-center justify-between pt-2">
              <div className="skeleton h-4 w-20 rounded-lg" />
              <div className="skeleton size-10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
