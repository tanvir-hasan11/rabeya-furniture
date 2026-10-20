import { and, eq, lt, sql } from "drizzle-orm";
import { db, hasDatabase, schema } from "@/db";
import { runJob } from "@/lib/jobs";

// Hourly: ends flash deals whose timer has passed and resyncs stock_status so
// the storefront badge never lags behind the rows it derives from.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDatabase()) return Response.json({ ok: true, skipped: "no database" });

  const result = await runJob("cron.flash-expiry", async () => {
    const ended = await db()
      .update(schema.products)
      .set({ isFlashDeal: false, updatedAt: new Date() })
      .where(and(eq(schema.products.isFlashDeal, true), lt(schema.products.flashEndsAt, new Date())))
      .returning({ id: schema.products.id });

    await db().execute(sql`
      update products set stock_status = case
        when stock <= 0 then 'out_of_stock'
        when stock <= low_stock_at then 'low_stock'
        else 'in_stock' end::stock_status
      where stock_status <> (case
        when stock <= 0 then 'out_of_stock'
        when stock <= low_stock_at then 'low_stock'
        else 'in_stock' end::stock_status)
    `);

    return ended.length;
  });

  return Response.json({ ok: result.ok, ended: result.ok ? result.value : 0 });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
