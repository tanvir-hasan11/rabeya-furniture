"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Field";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { RatingStars } from "@/components/ui/RatingStars";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Skeleton, ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DesignPage() {
  return (
    <div className="container-page flex flex-col gap-10 py-10">
      <header>
        <h1 className="text-2xl font-bold">ডিজাইন সিস্টেম</h1>
        <p className="mt-1 text-sm text-text-muted">
          প্রিমিটিভগুলো এক জায়গায় — স্ক্রিন বানানোর আগে এখানেই যাচাই করা হয়।
        </p>
      </header>

      <Section title="রঙ (রোল)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            ["bg", "bg-bg border"],
            ["surface", "bg-surface"],
            ["primary", "bg-primary"],
            ["secondary", "bg-secondary"],
            ["accent", "bg-accent"],
            ["danger", "bg-danger"],
            ["success", "bg-success"],
            ["warning", "bg-warning"],
            ["whatsapp", "bg-whatsapp"],
          ].map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-1">
              <div className={`h-16 rounded-md ${cls}`} />
              <span className="text-xs text-text-muted">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="টাইপ">
        <div className="flex flex-col gap-1">
          <p className="text-display">ডিসপ্লে ৩৬</p>
          <p className="text-2xl">হেডিং ২৮</p>
          <p className="text-xl">হেডিং ২৪</p>
          <p className="text-lg">সাবহেডিং ২০</p>
          <p className="text-base">বডি ১৬ — বাংলা টেক্সট উদাহরণ</p>
          <p className="text-sm">স্মল ১৪</p>
          <p className="text-xs">ক্যাপশন ১২</p>
        </div>
      </Section>

      <Section title="বাটন">
        <div className="flex flex-wrap items-center gap-3">
          <Button>প্রাইমারি</Button>
          <Button variant="secondary">সেকেন্ডারি</Button>
          <Button variant="accent">অ্যাকসেন্ট</Button>
          <Button variant="ghost">ঘোস্ট</Button>
          <Button variant="danger">ডেঞ্জার</Button>
          <Button variant="whatsapp">হোয়াটসঅ্যাপ</Button>
          <Button loading>লোডিং</Button>
          <Button disabled>ডিজেবল</Button>
          <Button size="sm">স্মল</Button>
          <Button size="lg">লার্জ</Button>
        </div>
      </Section>

      <Section title="ব্যাজ ও প্রাইস">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>নিউট্রাল</Badge>
          <Badge tone="success">স্টকে আছে</Badge>
          <Badge tone="warning">৩টি বাকি</Badge>
          <Badge tone="danger">-১৭%</Badge>
          <PriceBlock price={249900} comparePrice={299900} size="lg" />
          <RatingStars value={4.9} count={3} />
        </div>
      </Section>

      <Section title="ফর্ম">
        <div className="grid max-w-lg gap-4">
          <Field label="আপনার নাম" htmlFor="d-name" required>
            <Input id="d-name" placeholder="নাম লিখুন" />
          </Field>
          <Field label="জেলা" htmlFor="d-district">
            <Select id="d-district">
              <option>ঢাকা (সিটি)</option>
              <option>চট্টগ্রাম</option>
            </Select>
          </Field>
          <Field label="মোবাইল" htmlFor="d-phone" error="সঠিক নম্বর লিখুন">
            <Input id="d-phone" aria-invalid defaultValue="01" />
          </Field>
        </div>
      </Section>

      <Section title="স্টেটার">
        <QuantityStepper value={1} onChange={() => {}} />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Section>

      <Section title="এম্পটি স্টেট">
        <EmptyState title="কিছু পাওয়া যায়নি" hint="এটি একটি খালি অবস্থার উদাহরণ।" />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 border-b border-border pb-2 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
