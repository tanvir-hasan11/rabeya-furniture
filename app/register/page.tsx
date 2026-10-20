"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("রেজিস্ট্রেশন এখনো চালু হয়নি (Supabase কনফিগার করা হয়নি)।");
      return;
    }
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        data: { full_name: String(form.get("fullName")), phone: String(form.get("phone")) },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/account");
      router.refresh();
    } else {
      setNotice("নিশ্চিতকরণ লিংক আপনার ইমেইলে পাঠানো হয়েছে।");
    }
  }

  return (
    <div className="container-page max-w-md py-12">
      <h1 className="text-xl font-bold">নতুন অ্যাকাউন্ট</h1>
      <p className="mt-1 text-sm text-text-muted">অর্ডার হিস্ট্রি, উইশলিস্ট ও দ্রুত চেকআউটের জন্য।</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} aria-label="রেজিস্ট্রেশন">
        <Field label="আপনার নাম" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" autoComplete="name" required />
        </Field>
        <Field label="মোবাইল নম্বর" htmlFor="phone" hint="১১ সংখ্যা, ০১ দিয়ে শুরু">
          <Input id="phone" name="phone" inputMode="numeric" placeholder="০১৭xxxxxxxx" />
        </Field>
        <Field label="ইমেইল" htmlFor="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="পাসওয়ার্ড" htmlFor="password" hint="কমপক্ষে ৮ অক্ষর" required>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {notice && <p role="status" className="text-sm text-success">{notice}</p>}
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "অপেক্ষা করুন…" : "রেজিস্টার করুন"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        আগে থেকেই অ্যাকাউন্ট আছে?{" "}
        <Link href="/login" className="font-semibold text-primary underline">
          লগইন
        </Link>
      </p>
    </div>
  );
}
