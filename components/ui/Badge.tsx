import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-text-muted",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
  accent: "bg-accent text-accent-on",
};

export function Badge({
  tone = "neutral",
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...rest}
    />
  );
}
