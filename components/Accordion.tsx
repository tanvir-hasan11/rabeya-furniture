import type { ReactNode } from "react";

export function Accordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {items.map((it, i) => (
        <details key={i} className="group p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
            {it.q}
            <span aria-hidden="true" className="text-text-muted transition group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="pt-2 text-sm text-text-muted">{it.a}</div>
        </details>
      ))}
    </div>
  );
}
