import { NextResponse, after } from "next/server";
import { createOrder } from "@/lib/data";
import type { CreateOrderInput } from "@/lib/data/types";
import { getCurrentUser } from "@/lib/supabase/server";
import { runJob } from "@/lib/jobs";
import { emailConfigured, sendNewOrderAlert } from "@/lib/email";
import { firstIssue, orderSchema } from "@/lib/validation";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const limited = rateLimit(`order:${clientIp(request)}`, 10, 60_000);
  if (!limited.ok) return tooMany(limited.retryAfter);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "ভুল অনুরোধ" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 422 });

  try {
    const user = await getCurrentUser();
    const order = await createOrder({ ...parsed.data, customerId: user?.id } as CreateOrderInput);
    if (emailConfigured()) {
      after(() => runJob("order.alert", () => sendNewOrderAlert(order), { ref: order.orderNumber }));
    }
    return NextResponse.json({ orderNumber: order.orderNumber, total: order.total }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "অর্ডার সম্পন্ন হয়নি";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
