import type { Metadata } from "next";

export const metadata: Metadata = { title: "রিটার্ন ও রিফান্ড" };

export default function ReturnRefundPage() {
  const eligible = [
    "পণ্য ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ অবস্থায় পৌঁছালে",
    "ভুল পণ্য পাঠানো হলে",
    "ডেলিভারির ৭ দিনের মধ্যে অব্যবহৃত ও মূল প্যাকেজিংসহ ফেরত দিলে",
  ];
  const notEligible = [
    "ব্যবহৃত বা ইনস্টল করা পণ্য",
    "গ্রাহকের অসাবধানতায় ক্ষতিগ্রস্ত পণ্য",
    "কাস্টম বা বিশেষভাবে তৈরি পণ্য",
  ];
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-xl font-bold">রিটার্ন ও রিফান্ড</h1>
      <p className="mt-1 text-sm text-text-muted">কোনো সমস্যা হলে চিন্তার কিছু নেই — আমাদের রিটার্ন পলিসি সহজ ও স্বচ্ছ।</p>

      <section className="mt-6">
        <h2 className="font-semibold">রিটার্নযোগ্য যেসব ক্ষেত্রে</h2>
        <ul className="mt-2 space-y-1 text-sm text-text-muted">
          {eligible.map((x) => (
            <li key={x}>• {x}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">রিটার্নযোগ্য নয় যেসব ক্ষেত্রে</h2>
        <ul className="mt-2 space-y-1 text-sm text-text-muted">
          {notEligible.map((x) => (
            <li key={x}>• {x}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">রিফান্ড প্রক্রিয়া</h2>
        <p className="mt-2 text-sm text-text-muted">
          রিটার্ন পণ্য যাচাই করার পর ৩-৫ কার্যদিবসের মধ্যে রিফান্ড প্রসেস করা হয়। COD অর্ডারে বিকাশ/নগদ বা ব্যাংক
          ট্রান্সফারে, অনলাইন পেমেন্টে একই পেমেন্ট মাধ্যমে টাকা ফেরত দেওয়া হয়।
        </p>
      </section>
    </div>
  );
}
