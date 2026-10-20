import Link from "next/link";
import { Phone, Search } from "lucide-react";
import type { SiteSettings } from "@/lib/data/types";
import { CartButton } from "@/components/cart/CartButton";

export function Header({ settings }: { settings: SiteSettings }) {
  const nav = [
    { href: "/shop", label: "শপ" },
    { href: "/blog", label: "ব্লগ" },
    { href: "/track-order", label: "অর্ডার ট্র্যাক" },
    { href: "/contact", label: "যোগাযোগ" },
  ];
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-primary">{settings.storeName}</span>
          <span className="text-[11px] text-text-muted">ফোকাস অন কোয়ালিটি</span>
        </Link>

        <nav aria-label="প্রধান" className="ml-4 hidden items-center gap-5 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-text hover:text-accent">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/shop"
            aria-label="পণ্য খুঁজুন"
            className="hidden p-2 text-text-muted hover:text-accent sm:block"
          >
            <Search aria-hidden="true" className="h-5 w-5" />
          </Link>
          <a
            href={`tel:${settings.phone}`}
            aria-label="ফোন করুন"
            className="hidden p-2 text-text-muted hover:text-accent sm:block"
          >
            <Phone aria-hidden="true" className="h-5 w-5" />
          </a>
          <Link
            href="/wishlist"
            className="hidden p-2 text-sm font-medium text-text hover:text-accent sm:block"
          >
            উইশলিস্ট
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
