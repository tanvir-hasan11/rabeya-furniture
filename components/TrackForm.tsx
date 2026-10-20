"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatBDT, toBengaliDigits } from "@/lib/money";

interface TrackResult {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  districtName: string;
  items: { name: string; qty: number }[];
}

const statusLabel: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  confirmed: "কনফার্ম",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভার হয়েছে",
  cancelled: "বাতিল",
  returned: "ফেরত",
};

export function TrackForm() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/orders/track?number=${encodeURIComponent(number)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "অর্ডার পাওয়া যায়নি");
        return;
      }
      setResult(data);
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="অর্ডার নম্বর" htmlFor="t-number" required>
            <Input
              id="t-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="RF-20260101-0001"
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="মোবাইল নম্বর" htmlFor="t-phone" required>
            <Input
              id="t-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </Field>
        </div>
        <Button type="submit" loading={busy} className="sm:mb-0.5">
          ট্র্যাক করুন
        </Button>
      </form>

      {error && (
        <p role="alert" className="rounded-md bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {result && (
        <div className="rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{result.orderNumber}</span>
            <Badge tone="warning">{statusLabel[result.status] ?? result.status}</Badge>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {result.items.map((it, i) => (
              <li key={i}>
                {it.name} × {toBengaliDigits(it.qty)}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-text-muted">{result.districtName}</span>
            <span className="font-semibold">{formatBDT(result.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
