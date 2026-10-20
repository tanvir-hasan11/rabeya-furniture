import { and, eq, lte } from "drizzle-orm";
import { db, hasDatabase, schema } from "@/db";
import { runJob } from "@/lib/jobs";

// Daily: emails the shop a low-stock digest (products at or below their
// low-stock threshold). Logged in job_events; retried on transient failures.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDatabase()) return Response.json({ ok: true, skipped: "no database" });

  const low = await db()
    .select({
      name: schema.products.nameBn,
      stock: schema.products.stock,
      threshold: schema.products.lowStockAt,
    })
    .from(schema.products)
    .where(
      and(
        eq(schema.products.isActive, true),
        lte(schema.products.stock, schema.products.lowStockAt)
      )
    );

  const result = await runJob("cron.stock-alerts", async () => {
    const to = process.env.ORDER_ALERT_EMAIL;
    const key = process.env.RESEND_API_KEY;
    if (!to || !key || low.length === 0) return low.length;
    const { Resend } = await import("resend");
    const rows = low
      .map((p) => `<li>${p.name} — স্টক ${p.stock} (সীমা ${p.threshold})</li>`)
      .join("");
    await new Resend(key).emails.send({
      from: process.env.EMAIL_FROM ?? "Rabeya Furniture <orders@example.com>",
      to: [to],
      subject: `নিচু স্টক অ্যালার্ট — ${low.length}টি পণ্য`,
      html: `<ul>${rows}</ul>`,
    });
    return low.length;
  });

  return Response.json({ ok: result.ok, lowStock: low.length });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
