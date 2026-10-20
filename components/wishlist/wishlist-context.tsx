"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (item: WishlistItem) => boolean; // returns true if now saved
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistState | null>(null);
const STORAGE_KEY = "rabeya.wishlist.v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const has = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const toggle = useCallback((item: WishlistItem) => {
    let added = false;
    setItems((prev) => {
      if (prev.some((i) => i.productId === item.productId)) {
        return prev.filter((i) => i.productId !== item.productId);
      }
      added = true;
      return [...prev, item];
    });
    return added;
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const value = useMemo<WishlistState>(
    () => ({ items, count: items.length, has, toggle, remove }),
    [items, has, toggle, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistState {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
