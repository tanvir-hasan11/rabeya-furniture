import Link from "next/link";
import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import { getCategories, getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "শপ" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category }),
  ]);
  const active = categories.find((c) => c.slug === category);

  return (
    <div className="container-page flex flex-col gap-6 py-6">
      <nav aria-label="ব্রেডক্রাম্ব" className="text-sm text-text-muted">
        <Link href="/" className="hover:text-accent">হোম</Link>
        <span> / </span>
        <span className="text-text">{active ? active.name : "সব পণ্য"}</span>
      </nav>

      <header>
        <h1 className="text-xl font-bold">{active ? active.name : "আমাদের ডেকোর কালেকশন"}</h1>
        <p className="mt-1 text-sm text-text-muted">
          {products.length}টি পণ্য পাওয়া গেছে
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="ক্যাটাগরি ফিল্টার">
        <Link
          href="/shop"
          className={cn(
            "rounded-pill border px-4 py-1.5 text-sm font-medium",
            !category ? "border-accent bg-accent text-accent-on" : "border-border text-text-muted"
          )}
        >
          সব
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}`}
            className={cn(
              "rounded-pill border px-4 py-1.5 text-sm font-medium",
              category === c.slug ? "border-accent bg-accent text-accent-on" : "border-border text-text-muted"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-8 w-8" />}
          title="এই ক্যাটাগরিতে এখন কোনো পণ্য নেই"
          hint="অন্য ক্যাটাগরি দেখুন বা কিছুক্ষণ পরে আবার চেষ্টা করুন।"
          action={
            <Link href="/shop">
              <Button>সব পণ্য দেখুন</Button>
            </Link>
          }
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
