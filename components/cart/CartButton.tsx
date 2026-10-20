"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart-context";
import { toBengaliDigits } from "@/lib/money";

export function CartButton({ className }: { className?: string }) {
  const { count, openCart } = useCart();
  return (
    <button
      onClick={openCart}
      aria-label={`কার্ট খুলুন, ${toBengaliDigits(count)}টি পণ্য`}
      className={className ?? "relative p-2 text-text"}
    >
      <ShoppingCart aria-hidden="true" className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-bold text-white">
          {toBengaliDigits(count)}
        </span>
      )}
    </button>
  );
}
