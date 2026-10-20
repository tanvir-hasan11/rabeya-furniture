import { NextResponse } from "next/server";
import { trackOrder } from "@/lib/data";
import { trackSchema } from "@/lib/validation";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

export async function GET(request: Request) {
  const limited = rateLimit(`track:${clientIp(request)}`, 20, 60_000);
  if (!limited.ok) return tooMany(limited.retryAfter);

  const { searchParams } = new URL(request.url);
  const parsed = trackSchema.safeParse({
    number: searchParams.get("number") ?? "",
    phone: searchParams.get("phone") ?? "",
  });
  if (!parsed.success)
    return NextResponse.json({ error: "অর্ডার নম্বর ও মোবাইল নম্বর দিন" }, { status: 422 });

  const order = await trackOrder(parsed.data.number, parsed.data.phone);
  if (!order)
    return NextResponse.json({ error: "এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি" }, { status: 404 });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    districtName: order.districtName,
    items: order.items,
  });
}

