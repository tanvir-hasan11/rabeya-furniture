import Link from "next/link";
import type { ProductWithStatus } from "@/lib/data";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { StockBadge } from "@/components/ui/StockBadge";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { discountPercent } from "@/lib/money";

export function ProductCard({ product }: { product: ProductWithStatus }) {
  const pct = discountPercent(product.price, product.comparePrice);
  const out = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-bg shadow-sm transition hover:shadow-card">
      <div className="relative">
        <Link href={`/p/${product.slug}`} aria-label={product.name}>
          <ProductImage name={product.name} className={out ? "opacity-60" : undefined} />
        </Link>
        {pct !== null && (
          <div className="absolute left-2 top-2">
            <Badge tone="danger">-{pct}%</Badge>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <WishlistButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              comparePrice: product.comparePrice,
              stock: product.stock,
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/p/${product.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.name}
        </Link>
        <StockBadge product={product} />
        <PriceBlock price={product.price} comparePrice={product.comparePrice} size="sm" />
        <div className="mt-auto pt-1">
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              comparePrice: product.comparePrice,
              stock: product.stock,
            }}
            size="sm"
            fullWidth
            label="কার্টে যোগ করুন"
          />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: ProductWithStatus[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
