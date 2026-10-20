"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingCart, MessageCircle, User } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { toBengaliDigits } from "@/lib/money";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();
  const { count, openCart } = useCart();

  const item = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
      active ? "text-accent" : "text-text-muted"
    );

  return (
    <nav
      aria-label="প্রধান"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-bg sm:hidden"
      style={{ height: "var(--bottom-nav-height)" }}
    >
      <Link href="/" className={item(pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
        <Home aria-hidden="true" className="h-5 w-5" /> হোম
      </Link>
      <Link href="/shop" className={item(pathname.startsWith("/shop"))} aria-current={pathname.startsWith("/shop") ? "page" : undefined}>
        <Store aria-hidden="true" className="h-5 w-5" /> শপ
      </Link>
      <button
        onClick={openCart}
        className={item(false)}
        aria-label={count > 0 ? `কার্ট, ${toBengaliDigits(count)}টি পণ্য` : "কার্ট"}
      >
        <span className="relative">
          <ShoppingCart aria-hidden="true" className="h-5 w-5" />
          {count > 0 && (
            <span
              aria-hidden="true"
              data-count={toBengaliDigits(count)}
              className="before:content-[attr(data-count)] absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-danger px-1 text-[10px] font-bold text-white"
            />
          )}
        </span>
        কার্ট
      </button>
      <Link href="/live-chat" className={item(pathname.startsWith("/live-chat"))}>
        <MessageCircle aria-hidden="true" className="h-5 w-5" /> লাইভ চ্যাট
      </Link>
      <Link href="/account" className={item(pathname.startsWith("/account"))}>
        <User aria-hidden="true" className="h-5 w-5" /> প্রোফাইল
      </Link>
    </nav>
  );
}
