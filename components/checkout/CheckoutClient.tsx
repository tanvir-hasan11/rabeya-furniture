"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { District } from "@/lib/data/types";
import { useCart } from "@/components/cart/cart-context";
import { OrderForm } from "./OrderForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatBDT } from "@/lib/money";

export function CheckoutClient({ districts }: { districts: District[] }) {
  const { items, subtotal, ready, clear } = useCart();

  if (ready && items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-8 w-8" />}
        title="আপনার কার্টে কোনো পণ্য নেই"
        hint="অর্ডার করতে হলে প্রথমে শপ পেজ থেকে কার্টে পণ্য যোগ করুন।"
        action={
          <Link href="/shop">
            <Button>পণ্য পছন্দ করুন</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="order-2 lg:order-1">
        <OrderForm
          districts={districts}
          source="cart"
          lines={items.map((i) => ({
            productId: i.productId,
            name: i.name,
            unitPrice: i.price,
            qty: i.qty,
          }))}
          onSuccess={() => clear()}
        />
      </div>

      <aside className="order-1 lg:order-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">অর্ডার সারসংক্ষেপ</h2>
          <ul className="mt-3 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-3">
                <div className="w-12 shrink-0">
                  <ProductImage name={i.name} className="rounded-md" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-text-muted">
                    {formatBDT(i.price)} × {i.qty}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-text-muted">উপ-মোট</span>
            <span className="font-semibold">{formatBDT(subtotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
