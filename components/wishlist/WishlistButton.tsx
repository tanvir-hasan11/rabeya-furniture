"use client";

import { Heart } from "lucide-react";
import { useWishlist, type WishlistItem } from "./wishlist-context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

export function WishlistButton({
  product,
  className,
}: {
  product: WishlistItem;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const { show } = useToast();
  const saved = has(product.productId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `${product.name} — পছন্দের তালিকা থেকে সরান` : `${product.name} — পছন্দের তালিকায় রাখুন`}
      onClick={() => {
        const added = toggle(product);
        show(added ? "পছন্দের তালিকায় রাখা হয়েছে" : "পছন্দের তালিকা থেকে সরানো হয়েছে", "info");
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-pill border border-border bg-bg/95 shadow-sm",
        className
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn("h-4 w-4", saved ? "fill-danger text-danger" : "text-text-muted")}
      />
    </button>
  );
}
