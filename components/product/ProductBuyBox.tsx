"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { AddToCartButton, type CartProductInput } from "@/components/cart/AddToCartButton";
import { Button } from "@/components/ui/Button";

export function ProductBuyBox({ product }: { product: CartProductInput }) {
  const [qty, setQty] = useState(1);
  const out = product.stock <= 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-muted">পরিমাণ</span>
        <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
      </div>
      <div className="flex flex-wrap gap-3">
        <AddToCartButton product={product} qty={qty} size="lg" label="কার্টে যোগ করুন" />
        <a href="#order-form">
          <Button size="lg" variant="secondary" disabled={out}>
            সরাসরি অর্ডার
          </Button>
        </a>
      </div>
    </div>
  );
}
