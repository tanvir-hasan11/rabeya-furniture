import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { toBengaliDigits } from "@/lib/money";

export function RatingStars({
  value,
  count,
  size = "md",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? 14 : 16;
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label={`৫-এর মধ্যে ${toBengaliDigits(value.toFixed(1))}`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={dim}
          height={dim}
          aria-hidden="true"
          className={cn(
            i <= Math.round(value) ? "fill-warning text-warning" : "fill-none text-border"
          )}
        />
      ))}
      {count !== undefined && (
        <span className="text-xs text-text-muted">({toBengaliDigits(count)})</span>
      )}
    </span>
  );
}
