"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("লগইন এখনো চালু হয়নি (Supabase কনফিগার করা হয়নি)। অ্যাকাউন্ট ছাড়াই অর্ডার করতে পারবেন।");
      return;
    }
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setBusy(false);
    if (error) {
      setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  async function onGoogle() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return setError("Google লগইন এখনো চালু হয়নি");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="container-page max-w-md py-12">
      <h1 className="text-xl font-bold">লগইন</h1>
      <p className="mt-1 text-sm text-text-muted">
        লগইন করে আপনার সব অর্ডার একসাথে দেখুন। চাইলে লগইন ছাড়াও অর্ডার করা যায়।
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} aria-label="লগইন">
        <Field label="ইমেইল" htmlFor="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="পাসওয়ার্ড" htmlFor="password" required>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "অপেক্ষা করুন…" : "লগইন"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onGoogle}>
          Google দিয়ে লগইন
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        অ্যাকাউন্ট নেই?{" "}
        <Link href="/register" className="font-semibold text-primary underline">
          রেজিস্টার করুন
        </Link>
      </p>
    </div>
  );
}
