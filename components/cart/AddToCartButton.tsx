"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { useCart } from "./cart-context";
import { useToast } from "@/components/ui/toast";

export interface CartProductInput {
  productId: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
}

export function AddToCartButton({
  product,
  qty = 1,
  label = "কার্টে যোগ করুন",
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  onAdded,
}: {
  product: CartProductInput;
  qty?: number;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  fullWidth?: boolean;
  className?: string;
  onAdded?: () => void;
}) {
  const { add } = useCart();
  const { show } = useToast();
  const [busy, setBusy] = useState(false);
  const out = product.stock <= 0;

  function handle() {
    setBusy(true);
    add(
      {
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        maxStock: product.stock,
      },
      qty
    );
    show("কার্টে যোগ হয়েছে");
    onAdded?.();
    setTimeout(() => setBusy(false), 200);
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      disabled={out}
      loading={busy}
      onClick={handle}
      aria-label={out ? `${product.name} স্টক শেষ` : `${product.name} — ${label}`}
    >
      {!out && <ShoppingCart aria-hidden="true" className="h-4 w-4" />}
      {out ? "স্টক শেষ" : label}
    </Button>
  );
}
