"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatBDT } from "@/lib/money";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQty, remove, subtotal, count } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="কার্ট">
      <button
        aria-label="কার্ট বন্ধ করুন"
        onClick={closeCart}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-xl bg-bg shadow-pop sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[400px] sm:rounded-none"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">
            আপনার কার্ট {count > 0 && <span className="text-text-muted">({count})</span>}
          </h2>
          <button onClick={closeCart} aria-label="বন্ধ করুন" className="p-2 text-text-muted">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="আপনার কার্ট খালি"
            hint="শপ থেকে পছন্দের পণ্য যোগ করে অর্ডার সম্পন্ন করুন।"
            action={
              <Link href="/shop" onClick={closeCart}>
                <Button>শপে যান</Button>
              </Link>
            }
          />
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <Link href={`/p/${item.slug}`} onClick={closeCart} className="w-16 shrink-0">
                    <ProductImage name={item.name} className="rounded-md" />
                  </Link>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link href={`/p/${item.slug}`} onClick={closeCart} className="text-sm font-semibold">
                      {item.name}
                    </Link>
                    <span className="text-sm text-text-muted">{formatBDT(item.price)}</span>
                    <div className="mt-1 flex items-center justify-between">
                      <QuantityStepper
                        value={item.qty}
                        max={item.maxStock}
                        onChange={(n) => setQty(item.productId, n)}
                        label={`${item.name} পরিমাণ`}
                      />
                      <button
                        onClick={() => remove(item.productId)}
                        className="text-xs font-medium text-danger"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-text-muted">উপ-মোট</span>
                <span className="text-lg font-semibold">{formatBDT(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={closeCart}>
                <Button fullWidth size="lg">
                  চেকআউট করুন
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
