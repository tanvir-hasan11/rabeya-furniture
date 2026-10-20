import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "প্রাইভেসি পলিসি" };

export default async function PrivacyPolicyPage() {
  const s = await getSiteSettings();
  const sections = [
    { t: "কী তথ্য সংগ্রহ করি", d: "অর্ডার প্রক্রিয়ার জন্য নাম, ফোন নম্বর, ঠিকানা ও পেমেন্ট সংক্রান্ত প্রয়োজনীয় তথ্য।" },
    { t: "তথ্য কীভাবে ব্যবহার করি", d: "শুধু অর্ডার ডেলিভারি, গ্রাহক সেবা ও প্রয়োজনীয় যোগাযোগের জন্য। কোনো তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।" },
    { t: "তথ্যের নিরাপত্তা", d: "আপনার ব্যক্তিগত ও পেমেন্ট তথ্য এনক্রিপ্টেড ও নিরাপদ সার্ভারে সংরক্ষিত থাকে।" },
    { t: "যোগাযোগের অনুমতি", d: "অর্ডার আপডেট, অফার বা প্রয়োজনীয় নোটিফিকেশনের জন্য এসএমএস বা হোয়াটসঅ্যাপে যোগাযোগ করা হতে পারে।" },
  ];
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-xl font-bold">প্রাইভেসি পলিসি</h1>
      <p className="mt-1 text-sm text-text-muted">আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের কাছে সর্বোচ্চ অগ্রাধিকার।</p>
      <div className="mt-6 space-y-4">
        {sections.map((sec) => (
          <section key={sec.t}>
            <h2 className="font-semibold">{sec.t}</h2>
            <p className="mt-1 text-sm text-text-muted">{sec.d}</p>
          </section>
        ))}
      </div>
      <p className="mt-6 text-xs text-text-muted">
        * কোনো প্রশ্ন থাকলে {s.email} ঠিকানায় ইমেইল করুন অথবা {s.phone} নম্বরে যোগাযোগ করুন।
      </p>
    </div>
  );
}
