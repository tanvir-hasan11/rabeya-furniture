import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Package } from "lucide-react";
import {
  getDistricts,
  getProductBySlug,
  getRelatedProducts,
  getReviews,
} from "@/lib/data";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { StockBadge } from "@/components/ui/StockBadge";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { ProductGrid } from "@/components/ProductCard";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { DirectOrderSection } from "@/components/product/DirectOrderSection";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { Accordion } from "@/components/Accordion";
import { toBengaliDigits } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "পণ্য" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related, districts] = await Promise.all([
    getReviews(product.id),
    getRelatedProducts(product),
    getDistricts(),
  ]);

  const faq = [
    {
      q: "ডেলিভারি চার্জ কত এবং কতদিনের মধ্যে পাব?",
      a: "ঢাকা সিটির ভেতরে ৮০ টাকা, সিটির বাইরে সারাদেশে ১৫০ টাকা। ঢাকায় ১-২ দিন, বাইরে ৩-৪ দিন।",
    },
    {
      q: "পণ্য ডেলিভারিতে ক্ষতিগ্রস্ত হলে কী হবে?",
      a: "সেফ প্যাকেজিং করে পাঠানো হয়। কোনো সমস্যা হলে ডেলিভারি ম্যান থাকা অবস্থায় যোগাযোগ করুন, বিনামূল্যে বদলানো হবে।",
    },
    {
      q: "অর্ডার কনফার্ম করতে অগ্রিম পেমেন্ট লাগবে?",
      a: "না। ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে যাচাই করে তারপর পেমেন্ট করবেন।",
    },
  ];

  return (
    <div className="container-page flex flex-col gap-8 py-6">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> শপে ফিরে যান
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <div className="relative">
          <ProductImage name={product.name} className="rounded-lg border border-border" />
          <div className="absolute right-3 top-3">
            <WishlistButton
              className="h-10 w-10"
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

        {/* info */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.tagline && <p className="mt-1 text-text-muted">{product.tagline}</p>}
          </div>
          <div className="flex items-center gap-3">
            <RatingStars value={product.ratingAvg} count={product.reviewCount} />
            <StockBadge product={product} />
          </div>
          <PriceBlock price={product.price} comparePrice={product.comparePrice} size="lg" />
          <ProductBuyBox
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              comparePrice: product.comparePrice,
              stock: product.stock,
            }}
          />

          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold">বিস্তারিত বিবরণ</h2>
            <p className="mt-2 text-sm text-text-muted">{product.description}</p>
          </div>

          {product.benefits.length > 0 && (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-success" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {product.boxContents.length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Package aria-hidden="true" className="h-4 w-4" /> বক্সের ভিতরে যা থাকছে
              </h2>
              <ul className="mt-2 space-y-1">
                {product.boxContents.map((b) => (
                  <li key={b.title} className="text-sm">
                    <span className="font-semibold">{b.title}</span>
                    {b.subtitle && <span className="text-text-muted"> — {b.subtitle}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* reviews */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-lg font-semibold">গ্রাহকদের মতামত</h2>
          <RatingStars value={product.ratingAvg} count={product.reviewCount} />
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm text-text-muted">এখনো কোনো রিভিউ নেই।</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-surface text-sm font-semibold">
                    {r.authorName.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {r.authorName}
                      {r.city && <span className="text-text-muted"> ({r.city})</span>}
                    </p>
                    {r.isVerified && <Badge tone="success">ভেরিফাইড ক্রেতা</Badge>}
                  </div>
                </div>
                <div className="mt-2">
                  <RatingStars value={r.rating} size="sm" />
                </div>
                <p className="mt-2 text-sm text-text-muted">“{r.body}”</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* order form */}
      <DirectOrderSection
        product={{ productId: product.id, name: product.name, price: product.price, stock: product.stock }}
        districts={districts}
      />

      {/* faq */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">সচরাচর জিজ্ঞাসা</h2>
        <Accordion items={faq} />
      </section>

      {/* related */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">আরও প্রোডাক্ট দেখুন</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <p className="text-center text-xs text-text-muted">
        মোট রিভিউ: {toBengaliDigits(product.reviewCount)}
      </p>
    </div>
  );
}
