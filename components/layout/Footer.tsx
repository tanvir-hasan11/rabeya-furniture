import Link from "next/link";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/data/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-border bg-surface">
      <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="text-lg font-bold text-primary">{settings.storeName}</p>
          <p className="mt-2 text-sm text-text-muted">{settings.tagline}</p>
          <div className="mt-3 flex gap-3">
            <a href={settings.facebook} aria-label="ফেসবুক" className="text-text-muted hover:text-accent">
              <Facebook aria-hidden="true" className="h-5 w-5" />
            </a>
            <a href={settings.instagram} aria-label="ইনস্টাগ্রাম" className="text-text-muted hover:text-accent">
              <Instagram aria-hidden="true" className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              aria-label="হোয়াটসঅ্যাপ"
              className="text-text-muted hover:text-accent"
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
            </a>
          </div>
        </div>

        <nav aria-label="ক্যাটাগরি">
          <h2 className="text-sm font-semibold">ক্যাটাগরি</h2>
          <ul className="mt-3 space-y-2 text-sm text-text-muted">
            <li><Link href="/shop" className="hover:text-accent">সব পণ্য</Link></li>
            <li><Link href="/shop?category=flower-tub" className="hover:text-accent">ফ্লাওয়ার টাব</Link></li>
            <li><Link href="/shop?category=tree-plant" className="hover:text-accent">ট্রি প্ল্যান্ট</Link></li>
            <li><Link href="/shop?category=wall-stand" className="hover:text-accent">ওয়াল স্ট্যান্ড</Link></li>
          </ul>
        </nav>

        <nav aria-label="তথ্য">
          <h2 className="text-sm font-semibold">তথ্য</h2>
          <ul className="mt-3 space-y-2 text-sm text-text-muted">
            <li><Link href="/about" className="hover:text-accent">আমাদের সম্পর্কে</Link></li>
            <li><Link href="/faq" className="hover:text-accent">সচরাচর জিজ্ঞাসা</Link></li>
            <li><Link href="/delivery-policy" className="hover:text-accent">ডেলিভারি পলিসি</Link></li>
            <li><Link href="/return-refund" className="hover:text-accent">রিটার্ন ও রিফান্ড</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-accent">প্রাইভেসি পলিসি</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">যোগাযোগ</h2>
          <ul className="mt-3 space-y-2 text-sm text-text-muted">
            <li>{settings.address}</li>
            <li>{settings.phone}</li>
            <li>{settings.email}</li>
          </ul>
          <p className="mt-3 text-xs text-text-muted">ক্যাশ অন ডেলিভারি ও নিরাপদ পেমেন্ট</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-text-muted">
        © {year} {settings.storeName}। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
