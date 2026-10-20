import { Resend } from "resend";
import type { Order } from "@/lib/data/types";
import { formatBDT } from "@/lib/money";

// Transactional email via Resend, sent from the store's own domain.
// No-ops (returns false) when RESEND_API_KEY is not configured.
let _resend: Resend | null = null;

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

const from = () => process.env.EMAIL_FROM ?? "Rabeya Furniture <orders@example.com>";

function shell(heading: string, body: string) {
  return `<!doctype html><html lang="bn"><body style="margin:0;background:#f6f6f4;font-family:'Hind Siliguri',Arial,sans-serif;color:#16161a">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#3a3a40;color:#fff;border-radius:12px;padding:20px;text-align:center">
      <h1 style="margin:0;font-size:20px">রাবেয়া ফার্নিচার</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:.9">হাতে গড়া ডেকোর, আপনার ঘরের জন্য</p>
    </div>
    <div style="background:#fff;border:1px solid #e3e2dd;border-radius:12px;padding:20px;margin-top:16px">
      <h2 style="margin:0 0 12px;font-size:17px">${heading}</h2>
      ${body}
    </div>
    <p style="font-size:12px;color:#5b5b66;text-align:center;margin-top:16px">
      এই ইমেইলটি পাঠানো হয়েছে আপনার অর্ডারের তথ্য জানাতে।
    </p>
  </div></body></html>`;
}

function itemsTable(order: Order) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.name} × ${i.qty}</td><td style="padding:6px 0;text-align:right">${formatBDT(
          i.lineTotal
        )}</td></tr>`
    )
    .join("");
  const shipping = order.shippingFee === 0 ? "ফ্রি" : formatBDT(order.shippingFee);
  const discountRow =
    order.discount > 0
      ? `<tr><td style="padding:6px 0;color:#5b5b66">ছাড় ${order.couponCode ?? ""}</td><td style="padding:6px 0;text-align:right">−${formatBDT(order.discount)}</td></tr>`
      : "";
  return (
    `<table style="width:100%;border-collapse:collapse;font-size:14px">` +
    rows +
    `<tr><td style="padding:6px 0;color:#5b5b66">সাবটোটাল</td><td style="padding:6px 0;text-align:right">${formatBDT(order.subtotal)}</td></tr>` +
    `<tr><td style="padding:6px 0;color:#5b5b66">ডেলিভারি চার্জ</td><td style="padding:6px 0;text-align:right">${shipping}</td></tr>` +
    discountRow +
    `<tr><td style="padding:10px 0;font-weight:700;border-top:1px solid #e3e2dd">সর্বমোট</td>` +
    `<td style="padding:10px 0;text-align:right;font-weight:700;border-top:1px solid #e3e2dd">${formatBDT(order.total)}</td></tr>` +
    `</table>`
  );
}

// Notifies the store of a new order. Guest checkout has no customer email, so
// the shop's own inbox is the reliable recipient.
export async function sendNewOrderAlert(order: Order): Promise<boolean> {
  const resend = client();
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!resend || !to) return false;
  const body = `
    <p style="font-size:14px;margin:0 0 12px">নতুন অর্ডার এসেছে — <strong>${order.orderNumber}</strong></p>
    <p style="font-size:14px;margin:0 0 12px">${order.customerName} · ${order.phone}<br>${order.districtName}, ${order.address}</p>
    ${itemsTable(order)}`;
  await resend.emails.send({
    from: from(),
    to: [to],
    subject: `নতুন অর্ডার — ${order.orderNumber} (${formatBDT(order.total)})`,
    html: shell("নতুন অর্ডার", body),
  });
  return true;
}

export async function sendStatusUpdate(
  order: Order,
  toEmail: string | undefined,
  noteBn?: string
): Promise<boolean> {
  const resend = client();
  if (!resend || !toEmail) return false;
  const labels: Record<string, string> = {
    confirmed: "কনফার্ম হয়েছে",
    shipped: "পাঠানো হয়েছে",
    delivered: "ডেলিভার হয়েছে",
    cancelled: "বাতিল হয়েছে",
    returned: "ফেরত নেওয়া হয়েছে",
  };
  const body = `
    <p style="font-size:14px;margin:0 0 12px">অর্ডার <strong>${order.orderNumber}</strong> এখন: <strong>${
      labels[order.status] ?? order.status
    }</strong></p>
    ${noteBn ? `<p style="font-size:14px;margin:0 0 12px">${noteBn}</p>` : ""}
    ${itemsTable(order)}`;
  await resend.emails.send({
    from: from(),
    to: [toEmail],
    subject: `অর্ডার আপডেট — ${order.orderNumber}`,
    html: shell("অর্ডার স্ট্যাটাস আপডেট", body),
  });
  return true;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
