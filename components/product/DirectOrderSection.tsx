"use client";

import { useState } from "react";
import type { District } from "@/lib/data/types";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { OrderForm } from "@/components/checkout/OrderForm";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatBDT } from "@/lib/money";

export function DirectOrderSection({
  product,
  districts,
}: {
  product: { productId: string; name: string; price: number; stock: number };
  districts: District[];
}) {
  const [qty, setQty] = useState(1);
  return (
    <section id="order-form" className="scroll-mt-20 rounded-lg border border-border p-5">
      <h2 className="text-lg font-semibold">নিচের ফর্মটি পূরণ করে অর্ডার করুন</h2>
      <p className="mt-1 text-sm text-text-muted">
        আমাদের প্রতিনিধি কল করে অর্ডার কনফার্ম করবেন। কোনো অগ্রিম পেমেন্ট লাগবে না।
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-md bg-surface p-3">
        <div className="w-16 shrink-0">
          <ProductImage name={product.name} className="rounded-md" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{product.name}</p>
          <p className="text-sm text-text-muted">{formatBDT(product.price)}</p>
        </div>
        <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
      </div>

      <div className="mt-4">
        <OrderForm
          districts={districts}
          source="direct"
          lines={[
            { productId: product.productId, name: product.name, unitPrice: product.price, qty },
          ]}
          submitLabel="অর্ডার নিশ্চিত করুন"
        />
      </div>
    </section>
  );
}
