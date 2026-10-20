"use client";

import { useEffect, useState } from "react";
import { toBengaliDigits } from "@/lib/money";

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
    done: total <= 0,
  };
}

export function CountdownTimer({ endsAt, label = "শেষ হবে" }: { endsAt: string; label?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (now === null) return null;
  const { h, m, s, done } = parts(new Date(endsAt).getTime() - now);
  if (done) return <span className="text-xs text-text-muted">অফার শেষ</span>;

  const cell = (v: number, u: string) => (
    <span className="inline-flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-on">
      {toBengaliDigits(String(v).padStart(2, "0"))}
      <span className="font-normal opacity-80">{u}</span>
    </span>
  );

  return (
    <span className="inline-flex items-center gap-1" aria-label={`${label} ${h} ঘণ্টা ${m} মিনিট`}>
      {cell(h, "ঘ")}:{cell(m, "মি")}:{cell(s, "সে")}
    </span>
  );
}
