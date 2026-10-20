"use client";

import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistProvider } from "@/components/wishlist/wishlist-context";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}
