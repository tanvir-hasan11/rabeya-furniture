import Link from "next/link";
import type { Metadata } from "next";
import { TrackForm } from "@/components/TrackForm";

export const metadata: Metadata = { title: "অর্ডার ট্র্যাক" };

export default function TrackOrderPage() {
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-xl font-bold">আপনার অর্ডার ট্র্যাক করুন</h1>
      <p className="mt-1 text-sm text-text-muted">
        অর্ডার নম্বর ও অর্ডারের সময় দেওয়া মোবাইল নম্বর দিয়ে খুঁজুন।
      </p>
      <div className="mt-6">
        <TrackForm />
      </div>
      <p className="mt-6 text-sm text-text-muted">
        অ্যাকাউন্ট থাকলে{" "}
        <Link href="/account" className="font-medium text-accent">
          লগইন
        </Link>{" "}
        করে আপনার সব অর্ডার একসাথে দেখুন।
      </p>
    </div>
  );
}
