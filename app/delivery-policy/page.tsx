import type { Metadata } from "next";

export const metadata: Metadata = { title: "ডেলিভারি পলিসি" };

export default function DeliveryPolicyPage() {
  const blocks = [
    { t: "ঢাকার ভেতরে", d: "১-২ কার্যদিবসের মধ্যে ডেলিভারি, চার্জ ৮০ টাকা।" },
    { t: "ঢাকার বাইরে", d: "৩-৫ কার্যদিবসের মধ্যে ডেলিভারি, চার্জ ১৫০ টাকা।" },
    { t: "ফ্রি ডেলিভারি", d: "১৯৯৯ টাকা বা তার বেশি অর্ডারে ফ্রি ডেলিভারি প্রযোজ্য।" },
    { t: "অর্ডার প্রসেসিং", d: "অর্ডার কনফার্মের ২৪ ঘণ্টার মধ্যে পণ্য প্যাক করে কুরিয়ারে হস্তান্তর করা হয়।" },
  ];
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-xl font-bold">ডেলিভারি পলিসি</h1>
      <p className="mt-1 text-sm text-text-muted">আপনার অর্ডার কীভাবে এবং কতদিনে পৌঁছাবে, তার সম্পূর্ণ বিবরণ।</p>
      <div className="mt-6 space-y-3">
        {blocks.map((b) => (
          <div key={b.t} className="rounded-lg border border-border p-4">
            <p className="font-semibold">{b.t}</p>
            <p className="mt-1 text-sm text-text-muted">{b.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-text-muted">
        * প্রাকৃতিক দুর্যোগ, কুরিয়ার বিভ্রাট বা অনিবার্য পরিস্থিতিতে ডেলিভারি কিছুটা দেরি হতে পারে। এমন ক্ষেত্রে ফোন বা
        এসএমএসে জানানো হবে।
      </p>
    </div>
  );
}
