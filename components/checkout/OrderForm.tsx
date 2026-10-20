"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { District, PaymentMethod } from "@/lib/data/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatBDT } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/toast";

export interface OrderLine {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
}

const PHONE_RE = /^01[3-9][0-9]{8}$/;

export function OrderForm({
  districts,
  lines,
  source,
  onSuccess,
  submitLabel = "অর্ডার নিশ্চিত করুন",
}: {
  districts: District[];
  lines: OrderLine[];
  source: "cart" | "direct";
  onSuccess?: (orderNumber: string) => void;
  submitLabel?: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // A ref, not state, so two clicks in the same tick cannot both get through.
  const inFlight = useRef(false);
  // Stable per-attempt key: a resubmitted form returns the same order, never two.
  const idempotencyKey = useRef<string | null>(null);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
    [lines]
  );
  const district = districts.find((d) => d.id === districtId);
  const freeDelivery = subtotal >= 199900; // settings threshold mirrored
  const shipping = district ? (freeDelivery ? 0 : district.shippingFee) : 0;
  const total = subtotal + shipping - discount;

  async function applyCoupon() {
    if (!coupon.trim()) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, subtotal }),
    });
    const data = await res.json();
    setDiscount(data.valid ? data.discount : 0);
    setCouponMsg(data.message ?? null);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "আপনার নাম লিখুন";
    if (!PHONE_RE.test(phone.replace(/[\s-]/g, ""))) e.phone = "সঠিক মোবাইল নম্বর লিখুন (যেমন ০১৭xxxxxxxx)";
    if (!districtId) e.district = "জেলা নির্বাচন করুন";
    if (address.trim().length < 6) e.address = "সম্পূর্ণ ঠিকানা লিখুন";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (inFlight.current) return;
    if (!validate()) return;
    inFlight.current = true;
    setSubmitting(true);
    idempotencyKey.current ??=
      globalThis.crypto?.randomUUID?.() ?? `of-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone: phone.replace(/[\s-]/g, ""),
          districtId,
          address,
          paymentMethod: payment,
          couponCode: discount > 0 ? coupon : undefined,
          note,
          source,
          idempotencyKey: idempotencyKey.current,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error ?? "অর্ডার সম্পন্ন হয়নি", "error");
        return;
      }
      show("অর্ডার সফল হয়েছে");
      idempotencyKey.current = null;
      onSuccess?.(data.orderNumber);
      router.push(`/order/${data.orderNumber}`);
    } catch {
      show("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন", "error");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="আপনার নাম" htmlFor="of-name" required error={errors.name}>
          <Input
            id="of-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label="মোবাইল নম্বর" htmlFor="of-phone" required error={errors.phone}>
          <Input
            id="of-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!errors.phone}
          />
        </Field>
      </div>

      <Field label="জেলা নির্বাচন করুন" htmlFor="of-district" required error={errors.district}>
        <Select
          id="of-district"
          name="district"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          aria-invalid={!!errors.district}
        >
          <option value="">— নির্বাচন করুন —</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="ডেলিভারি ঠিকানা" htmlFor="of-address" required error={errors.address}>
        <Textarea
          id="of-address"
          name="address"
          autoComplete="street-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-invalid={!!errors.address}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">পেমেন্ট পদ্ধতি</legend>
        <label className="flex items-center gap-2 rounded-sm border border-border px-3 py-2">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={payment === "cod"}
            onChange={() => setPayment("cod")}
          />
          <span className="text-sm">ক্যাশ অন ডেলিভারি</span>
        </label>
        <label className={cn("flex items-center gap-2 rounded-sm border border-border px-3 py-2 opacity-60")}>
          <input type="radio" name="payment" value="online" disabled />
          <span className="text-sm">অনলাইন (শীঘ্রই)</span>
        </label>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="of-coupon" className="text-sm font-semibold">
          কুপন কোড আছে?
        </label>
        <div className="flex gap-2">
          <Input
            id="of-coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
          />
          <Button type="button" variant="ghost" onClick={applyCoupon}>
            প্রয়োগ
          </Button>
        </div>
        {couponMsg && <p className="text-xs text-text-muted">{couponMsg}</p>}
      </div>

      <Field label="নোট (ঐচ্ছিক)" htmlFor="of-note">
        <Input id="of-note" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      <div className="rounded-md bg-surface p-4 text-sm">
        <Row label="উপ-মোট" value={formatBDT(subtotal)} />
        <Row label="শিপিং চার্জ" value={shipping === 0 ? "ফ্রি" : formatBDT(shipping)} />
        {discount > 0 && <Row label="ছাড়" value={`- ${formatBDT(discount)}`} />}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="font-semibold">সর্বমোট মূল্য</span>
          <span className="text-lg font-bold">{formatBDT(total)}</span>
        </div>
      </div>

      <Button type="submit" size="lg" loading={submitting}>
        {submitLabel} ({formatBDT(total)})
      </Button>
      <p className="text-center text-xs text-text-muted">
        অর্ডার নিশ্চিত করতে আমাদের প্রতিনিধি কল করবেন। কোনো অগ্রিম পেমেন্ট লাগবে না।
      </p>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-text-muted">
      <span>{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
