import type { Metadata } from "next";
import { getDistricts } from "@/lib/data";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = { title: "চেকআউট" };

export default async function CheckoutPage() {
  const districts = await getDistricts();
  return (
    <div className="container-page flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-xl font-bold">চেকআউট ও বিলিং</h1>
        <p className="mt-1 text-sm text-text-muted">অর্ডার সম্পন্ন করতে ফর্মটি পূরণ করুন।</p>
      </header>
      <CheckoutClient districts={districts} />
    </div>
  );
}
