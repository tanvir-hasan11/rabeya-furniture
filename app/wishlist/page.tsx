"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export default function WishlistPage() {
  const { items, remove } = useWishlist();

  return (
    <div className="container-page py-8">
      <h1 className="text-xl font-bold">পছন্দের তালিকা</h1>
      <p className="mt-1 text-sm text-text-muted">
        পছন্দের প্রোডাক্টগুলো এখানে সংরক্ষিত থাকে, পরে সহজে অর্ডার করতে পারবেন।
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="আপনার পছন্দের তালিকা খালি"
          hint="পছন্দের প্রোডাক্টে হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।"
          action={
            <Link href="/shop">
              <Button>কেনাকাটা শুরু করুন</Button>
            </Link>
          }
        />
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.productId} className="flex flex-col overflow-hidden rounded-lg border border-border bg-bg">
              <Link href={`/p/${item.slug}`}>
                <ProductImage name={item.name} />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Link href={`/p/${item.slug}`} className="line-clamp-2 text-sm font-semibold">
                  {item.name}
                </Link>
                <PriceBlock price={item.price} comparePrice={item.comparePrice} size="sm" />
                <div className="mt-auto flex flex-col gap-2">
                  <AddToCartButton
                    size="sm"
                    fullWidth
                    product={{
                      productId: item.productId,
                      slug: item.slug,
                      name: item.name,
                      price: item.price,
                      comparePrice: item.comparePrice,
                      stock: item.stock,
                    }}
                  />
                  <button
                    onClick={() => remove(item.productId)}
                    className="text-xs font-medium text-danger"
                  >
                    সরান
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
