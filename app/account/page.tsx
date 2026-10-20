import Link from "next/link";
import type { Metadata } from "next";
import { Package, User } from "lucide-react";
import { Field, Input } from "@/components/ui/Field";

import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { getOrdersByCustomer } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/money";

export const metadata: Metadata = { title: "প্রোফাইল" };
export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  confirmed: "কনফার্ম",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল",
  returned: "ফেরত",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="container-page max-w-md py-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-surface text-primary">
            <User aria-hidden="true" className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold">আপনার অ্যাকাউন্ট</h1>
          <p className="text-sm text-text-muted">
            লগইন করে আপনার সব অর্ডার একসাথে দেখুন। অ্যাকাউন্ট না থাকলেও অর্ডার করা যায়।
          </p>
        </div>

        <form className="mt-6 flex flex-col gap-4" aria-label="লগইন">
          <Field label="ইমেইল" htmlFor="acc-id" required>
            <Input id="acc-id" name="email" type="email" autoComplete="email" />
          </Field>
          <Field label="পাসওয়ার্ড" htmlFor="acc-pass" required>
            <Input id="acc-pass" name="password" type="password" autoComplete="current-password" />
          </Field>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-primary-on transition hover:brightness-110"
          >
            লগইন করুন
          </Link>
          <p className="text-center text-xs text-text-muted">
            অ্যাকাউন্ট নেই?{" "}
            <Link href="/register" className="font-semibold text-primary underline">
              রেজিস্টার করুন
            </Link>
          </p>
        </form>
      </div>
    );
  }

  const orders = await getOrdersByCustomer(user.id);

  return (
    <div className="container-page max-w-3xl py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">আপনার অ্যাকাউন্ট</h1>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mt-8 text-lg font-bold">অর্ডার হিস্ট্রি</h2>
      {orders.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-border py-12 text-center">
          <Package aria-hidden="true" className="h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-muted">এখনো কোনো অর্ডার নেই।</p>
          <Link
            href="/shop"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-primary transition hover:bg-surface"
          >
            কেনাকাটা শুরু করুন
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/order/${o.orderNumber}`} className="font-semibold text-primary">
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-text-muted">
                  {new Date(o.createdAt).toLocaleDateString("bn-BD")} · {o.items.length} পণ্য
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="warning">{statusLabel[o.status] ?? o.status}</Badge>
                <span className="font-semibold">{formatBDT(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
