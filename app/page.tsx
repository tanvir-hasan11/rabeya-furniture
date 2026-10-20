import Link from "next/link";
import { Truck, ShieldCheck, RotateCcw, HandHeart } from "lucide-react";
import { getCategories, getProducts, getSiteSettings } from "@/lib/data";
import { ProductGrid } from "@/components/ProductCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Button } from "@/components/ui/Button";
import { toBengaliDigits } from "@/lib/money";

export default async function HomePage() {
  const [settings, categories, featured, flash] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getProducts({ featured: true }),
    getProducts({ flash: true }),
  ]);

  const flashEnd = flash.find((p) => p.flashEndsAt)?.flashEndsAt;

  return (
    <div className="container-page flex flex-col gap-10 py-6">
      {/* announcement */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-md bg-surface px-4 py-2 text-center text-sm">
        <span>{settings.announcement}</span>
        <span className="rounded-pill bg-accent px-2 py-0.5 text-xs font-semibold text-accent-on">
          কোড: {settings.announcementCode}
        </span>
      </div>

      {/* hero */}
      <section className="overflow-hidden rounded-lg border border-border bg-surface px-6 py-12 text-center">
        <p className="text-sm font-medium text-text-muted">ফোকাস অন কোয়ালিটি</p>
        <h1 className="mx-auto mt-2 max-w-2xl text-2xl font-bold sm:text-display">
          ঘর সাজান আভিজাত্যে — হাতে তৈরি ডেকোর
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-text-muted">
          ফ্লাওয়ার টাব, ট্রি প্ল্যান্ট ও ওয়াল স্ট্যান্ড — দেশীয় কারিগরদের হাতে তৈরি, সারা দেশে ক্যাশ অন ডেলিভারি।
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/shop">
            <Button size="lg">শপে যান</Button>
          </Link>
          <Link href="/track-order">
            <Button size="lg" variant="ghost">
              অর্ডার ট্র্যাক করুন
            </Button>
          </Link>
        </div>
      </section>

      {/* categories */}
      <section>
        <SectionHead title="ক্যাটাগরি অনুযায়ী শপ করুন" href="/shop" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/shop"
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-bg p-4 hover:border-accent/50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-surface text-primary">
              <HandHeart aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">সব দেখুন</span>
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-bg p-4 hover:border-accent/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-surface text-primary">
                {c.name.slice(0, 1)}
              </span>
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* flash deals */}
      {flash.length > 0 && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">ফ্ল্যাশ ডিলস</h2>
            <div className="flex items-center gap-2">
              {flashEnd && <CountdownTimer endsAt={flashEnd} />}
              <Link href="/shop" className="text-sm font-medium text-accent">
                সব দেখুন
              </Link>
            </div>
          </div>
          <ProductGrid products={flash} />
        </section>
      )}

      {/* promo banners */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-accent">অতিরিক্ত {toBengaliDigits(10)}% ছাড়</p>
          <p className="mt-1 text-lg font-bold">আপনার প্রথম অর্ডারে</p>
          <p className="mt-1 text-sm text-text-muted">কোড: {settings.announcementCode}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-accent">ফ্রি ডেলিভারি</p>
          <p className="mt-1 text-lg font-bold">{settings.freeDeliveryNote}</p>
          <p className="mt-1 text-sm text-text-muted">সারা দেশে ক্যাশ অন ডেলিভারি</p>
        </div>
      </section>

      {/* featured */}
      <section>
        <SectionHead title="ফিচার্ড প্রোডাক্টস" href="/shop" />
        <ProductGrid products={featured} />
      </section>

      {/* trust */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: <Truck className="h-5 w-5" />, t: "দ্রুত ডেলিভারি" },
          { icon: <ShieldCheck className="h-5 w-5" />, t: "ক্যাশ অন ডেলিভারি" },
          { icon: <RotateCcw className="h-5 w-5" />, t: "সহজ রিটার্ন" },
          { icon: <HandHeart className="h-5 w-5" />, t: "হাতে তৈরি" },
        ].map((x) => (
          <div key={x.t} className="flex flex-col items-center gap-2 rounded-md border border-border p-4 text-center">
            <span className="text-primary">{x.icon}</span>
            <span className="text-sm font-medium">{x.t}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link href={href} className="text-sm font-medium text-accent">
        সব দেখুন
      </Link>
    </div>
  );
}
