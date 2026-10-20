import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/data";
import { formatBDT } from "@/lib/money";
import { couponSchema, firstIssue } from "@/lib/validation";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const limited = rateLimit(`coupon:${clientIp(request)}`, 30, 60_000);
  if (!limited.ok) return tooMany(limited.retryAfter);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, reason: "ভুল অনুরোধ" }, { status: 400 });
  }

  const parsed = couponSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ valid: false, reason: firstIssue(parsed.error) }, { status: 422 });

  const res = await validateCoupon(parsed.data.code, parsed.data.subtotal);
  return NextResponse.json({
    ...res,
    message: res.valid ? `ছাড় প্রয়োগ হয়েছে: ${formatBDT(res.discount)}` : res.reason,
  });
}
