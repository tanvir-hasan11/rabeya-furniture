import type { Metadata } from "next";
import { HandHeart, Gem, Users, Truck } from "lucide-react";

export const metadata: Metadata = { title: "আমাদের সম্পর্কে" };

export default function AboutPage() {
  const values = [
    { icon: <HandHeart className="h-5 w-5" />, t: "হাতে তৈরি ভালোবাসা", d: "প্রতিটি পণ্য দেশীয় কারিগরদের হাতে যত্নে তৈরি।" },
    { icon: <Gem className="h-5 w-5" />, t: "প্রিমিয়াম কোয়ালিটি", d: "উন্নত উপকরণে দীর্ঘস্থায়ী পণ্য।" },
    { icon: <Users className="h-5 w-5" />, t: "গ্রাহক প্রথম", d: "সততার সঙ্গে হাজারো গ্রাহকের আস্থা।" },
    { icon: <Truck className="h-5 w-5" />, t: "নির্ভরযোগ্য সেবা", d: "সময়মতো ডেলিভারি ও নিরাপদ পেমেন্ট।" },
  ];
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-xl font-bold">আমাদের সম্পর্কে</h1>
      <p className="mt-3 text-base text-text-muted">
        আমরা ঢাকার একটি হাতে তৈরি হোম ডেকোর ব্র্যান্ড, যারা প্রতিটি ঘরকে সুন্দর ও প্রাণবন্ত করে তুলতে বিশ্বাসী।
      </p>
      <h2 className="mt-8 text-lg font-semibold">আমাদের গল্প</h2>
      <p className="mt-2 text-base text-text-muted">
        শুরুটা হয়েছিল একটি ছোট্ট স্বপ্ন দিয়ে — বাংলাদেশের প্রতিটি ঘরে প্রকৃতির ছোঁয়া ও প্রিমিয়াম সাজসজ্জা পৌঁছে দেওয়া।
        ফ্লাওয়ার টাব, ট্রি প্ল্যান্ট ও ওয়াল স্ট্যান্ড থেকে শুরু করে প্রতিটি পণ্যে গুণগত মান ও নান্দনিকতাকে সবচেয়ে বেশি
        গুরুত্ব দিই। লক্ষ্য শুধু পণ্য বিক্রি নয়, প্রতিটি গ্রাহকের ঘরকে আরও সুন্দর করে তোলা।
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.t} className="rounded-lg border border-border p-4">
            <span className="text-primary">{v.icon}</span>
            <p className="mt-2 font-semibold">{v.t}</p>
            <p className="mt-1 text-sm text-text-muted">{v.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
