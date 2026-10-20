import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-2", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
