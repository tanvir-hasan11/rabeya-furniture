import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

// Clean-room placeholder. The original's product photography is theirs and is
// never used; a real catalogue supplies its own images. Until then every
// product renders this neutral tile.
export function ProductImage({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={name ? `${name} — ছবি শীঘ্রই` : "পণ্যের ছবি শীঘ্রই"}
      className={cn(
        "flex aspect-square w-full items-center justify-center bg-surface text-text-muted",
        className
      )}
    >
      <ImageOff aria-hidden="true" className="h-8 w-8 opacity-50" />
    </div>
  );
}
