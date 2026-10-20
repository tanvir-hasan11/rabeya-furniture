import type { Metadata } from "next";
import { Phone, MessageCircle, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "যোগাযোগ" };

export default async function ContactPage() {
  const s = await getSiteSettings();
  const cards = [
    { icon: <Phone className="h-5 w-5" />, t: "ফোন করুন", v: s.phone, href: `tel:${s.phone}` },
    { icon: <MessageCircle className="h-5 w-5" />, t: "হোয়াটসঅ্যাপ", v: s.phone, href: `https://wa.me/${s.whatsapp}` },
    { icon: <Mail className="h-5 w-5" />, t: "ইমেইল করুন", v: s.email, href: `mailto:${s.email}` },
  ];
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-xl font-bold">যোগাযোগ করুন</h1>
      <p className="mt-1 text-sm text-text-muted">যেকোনো প্রশ্ন বা সহায়তার জন্য সরাসরি যোগাযোগ করুন।</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <a key={c.t} href={c.href} className="rounded-lg border border-border p-5 hover:border-accent/50">
            <span className="text-primary">{c.icon}</span>
            <p className="mt-2 font-semibold">{c.t}</p>
            <p className="text-sm text-text-muted">{c.v}</p>
          </a>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border p-5">
        <p className="flex items-center gap-2 font-semibold">
          <MapPin aria-hidden="true" className="h-4 w-4 text-primary" /> ঠিকানা
        </p>
        <p className="mt-1 text-sm text-text-muted">{s.address}</p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <a href={s.facebook} aria-label="ফেসবুক" className="text-text-muted hover:text-accent">
          <Facebook aria-hidden="true" className="h-5 w-5" />
        </a>
        <a href={s.instagram} aria-label="ইনস্টাগ্রাম" className="text-text-muted hover:text-accent">
          <Instagram aria-hidden="true" className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
