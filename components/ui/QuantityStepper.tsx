"use client";

import { Minus, Plus } from "lucide-react";
import { toBengaliDigits } from "@/lib/money";

export function QuantityStepper({
  value,
  onChange,
  max = 99,
  min = 1,
  label = "পরিমাণ",
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  min?: number;
  label?: string;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="পরিমাণ কমান"
        className="flex h-9 w-9 items-center justify-center text-text disabled:opacity-40"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm font-semibold">
        {toBengaliDigits(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="পরিমাণ বাড়ান"
        className="flex h-9 w-9 items-center justify-center text-text disabled:opacity-40"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
