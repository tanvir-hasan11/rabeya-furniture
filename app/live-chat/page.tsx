import type { Metadata } from "next";
import { MessageCircle, Phone, ShieldCheck, Clock } from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";

export const metadata: Metadata = { title: "লাইভ চ্যাট" };

export default async function LiveChatPage() {
  const s = await getSiteSettings();
  return (
    <div className="container-page max-w-2xl py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex -space-x-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 w-10 overflow-hidden rounded-pill border-2 border-bg">
              <ProductImage name="সাপোর্ট এজেন্ট" />
            </div>
          ))}
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">কাস্টমার কেয়ার</p>
        <h1 className="text-xl font-bold">লাইভ চ্যাট সাপোর্ট</h1>
        <p className="max-w-md text-sm text-text-muted">
          আমাদের সাপোর্ট টিম হোয়াটসঅ্যাপে আপনার সব প্রশ্ন, ডেলিভারি আপডেট বা অর্ডারের সহায়তায় প্রস্তুত।
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <a href={`https://wa.me/${s.whatsapp}`}>
            <Button variant="whatsapp" size="lg">
              <MessageCircle aria-hidden="true" className="h-5 w-5" /> হোয়াটসঅ্যাপে চ্যাট করুন
            </Button>
          </a>
          <a href={`tel:${s.phone}`}>
            <Button variant="ghost" size="lg">
              <Phone aria-hidden="true" className="h-5 w-5" /> সরাসরি কল করুন
            </Button>
          </a>
        </div>
      </div>

      <ul className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { icon: <Clock className="h-5 w-5" />, t: "৫ মিনিটে রেসপন্স", d: "এজেন্টদের কাছ থেকে দ্রুত উত্তর" },
          { icon: <ShieldCheck className="h-5 w-5" />, t: "নিরাপদ ও গোপন", d: "আপনার তথ্য সম্পূর্ণ গোপন" },
          { icon: <MessageCircle className="h-5 w-5" />, t: "চ্যাটে অর্ডার", d: "পণ্যের নাম দিয়ে সহজে অর্ডার" },
        ].map((x) => (
          <li key={x.t} className="rounded-lg border border-border p-4">
            <span className="text-primary">{x.icon}</span>
            <p className="mt-2 text-sm font-semibold">{x.t}</p>
            <p className="text-xs text-text-muted">{x.d}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
