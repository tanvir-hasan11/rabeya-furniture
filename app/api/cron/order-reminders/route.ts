import { and, eq, lt } from "drizzle-orm";
import { db, hasDatabase, schema } from "@/db";
import { runJob } from "@/lib/jobs";

// Daily: flags orders still pending after 12h so staff can call the customer.
// Writes to order_status_history (a no-op note) and logs the sweep in job_events.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDatabase()) return Response.json({ ok: true, skipped: "no database" });

  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const stale = await db()
    .select({ id: schema.orders.id, orderNumber: schema.orders.orderNumber })
    .from(schema.orders)
    .where(and(eq(schema.orders.status, "pending"), lt(schema.orders.createdAt, cutoff)));

  const result = await runJob("cron.order-reminders", async () => {
    for (const o of stale) {
      await db().insert(schema.orderStatusHistory).values({
        orderId: o.id,
        status: "pending",
        noteBn: "১২ ঘণ্টা পরেও কনফার্ম হয়নি — কল করুন",
      });
    }
    return stale.length;
  });

  return Response.json({ ok: result.ok, flagged: stale.length });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
