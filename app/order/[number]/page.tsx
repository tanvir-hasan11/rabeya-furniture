import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getOrderByNumber } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatBDT, toBengaliDigits } from "@/lib/money";

export const metadata: Metadata = { title: "অর্ডার সম্পন্ন" };

const statusLabel: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  confirmed: "কনফার্ম",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল",
  returned: "ফেরত",
};

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const order = await getOrderByNumber(decodeURIComponent(number));
  if (!order) notFound();

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 aria-hidden="true" className="h-12 w-12 text-success" />
        <h1 className="text-2xl font-bold">অর্ডার সফল হয়েছে!</h1>
        <p className="text-sm text-text-muted">
          আমাদের প্রতিনিধি শীঘ্রই কল করে অর্ডার কনফার্ম করবেন। কোনো অগ্রিম পেমেন্ট লাগবে না।
        </p>
        <div className="rounded-md bg-surface px-4 py-2 text-sm">
          অর্ডার নম্বর: <span className="font-bold">{order.orderNumber}</span>
        </div>
        <Badge tone="warning">{statusLabel[order.status] ?? order.status}</Badge>
      </div>

      <div className="mt-8 rounded-lg border border-border p-5">
        <h2 className="text-sm font-semibold">অর্ডারের পণ্য</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((it) => (
            <li key={it.productId} className="flex items-center justify-between py-2 text-sm">
              <span>
                {it.name} <span className="text-text-muted">× {toBengaliDigits(it.qty)}</span>
              </span>
              <span>{formatBDT(it.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <Row label="উপ-মোট" value={formatBDT(order.subtotal)} />
          <Row label="শিপিং চার্জ" value={order.shippingFee === 0 ? "ফ্রি" : formatBDT(order.shippingFee)} />
          {order.discount > 0 && <Row label="ছাড়" value={`- ${formatBDT(order.discount)}`} />}
          <div className="flex items-center justify-between pt-1 font-semibold">
            <span>সর্বমোট</span>
            <span className="text-lg">{formatBDT(order.total)}</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-text-muted">
          <p>ডেলিভারি: {order.customerName}, {order.districtName}</p>
          <p>{order.address}</p>
          <p>{toBengaliDigits(order.phone)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/track-order">
          <Button>অর্ডার ট্র্যাক করুন</Button>
        </Link>
        <Link href="/shop">
          <Button variant="ghost">আরও কিনুন</Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-text-muted">
      <span>{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
