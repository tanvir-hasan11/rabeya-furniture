import { formatBDT, discountPercent } from "@/lib/money";
import { Badge } from "./Badge";
import { cn } from "@/lib/cn";

export function PriceBlock({
  price,
  comparePrice,
  size = "md",
  className,
}: {
  price: number;
  comparePrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pct = discountPercent(price, comparePrice);
  const priceCls = size === "lg" ? "text-xl" : size === "sm" ? "text-sm font-semibold" : "text-base font-semibold";
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className={cn("text-text", priceCls)}>{formatBDT(price)}</span>
      {comparePrice && comparePrice > price && (
        <span className="text-sm text-text-muted line-through">{formatBDT(comparePrice)}</span>
      )}
      {pct !== null && <Badge tone="danger">-{pct}%</Badge>}
    </div>
  );
}
