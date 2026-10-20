import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      {icon && <div className="text-text-muted">{icon}</div>}
      <p className="text-lg font-semibold text-text">{title}</p>
      {hint && <p className="max-w-sm text-sm text-text-muted">{hint}</p>}
      {action}
    </div>
  );
}
