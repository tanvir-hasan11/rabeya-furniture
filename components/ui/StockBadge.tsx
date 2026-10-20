import { Badge } from "./Badge";
import type { ProductWithStatus } from "@/lib/data";

export function StockBadge({ product }: { product: Pick<ProductWithStatus, "stock" | "stockStatus" | "lowStockAt"> }) {
  if (product.stockStatus === "out_of_stock") return <Badge tone="neutral">স্টক শেষ</Badge>;
  if (product.stockStatus === "low_stock") return <Badge tone="warning">{product.stock}টি বাকি</Badge>;
  return <Badge tone="success">স্টকে আছে</Badge>;
}
