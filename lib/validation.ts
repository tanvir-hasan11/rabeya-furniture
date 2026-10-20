import { z } from "zod";

// Server-side input validation. Every mutating route parses its body through
// one of these before touching the data layer.

export const BD_PHONE = /^01[3-9][0-9]{8}$/;

export const orderSchema = z.object({
  customerName: z.string().trim().min(2, "আপনার নাম লিখুন").max(80),
  phone: z.string().trim().transform((v) => v.replace(/[\s-]/g, "")).refine((v) => BD_PHONE.test(v), "সঠিক মোবাইল নম্বর লিখুন"),
  districtId: z.string().trim().min(1, "জেলা নির্বাচন করুন"),
  address: z.string().trim().min(6, "সম্পূর্ণ ঠিকানা লিখুন").max(300),
  paymentMethod: z.enum(["cod", "online"]).default("cod"),
  source: z.enum(["cart", "direct"]).default("cart"),
  couponCode: z.string().trim().max(40).optional(),
  note: z.string().trim().max(300).optional(),
  idempotencyKey: z.string().trim().min(8).max(80).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        qty: z.number().int().positive().max(50),
      })
    )
    .min(1, "কার্ট খালি"),
});

export const trackSchema = z.object({
  number: z.string().trim().min(1),
  phone: z.string().trim().min(1),
});

export const couponSchema = z.object({
  code: z.string().trim().min(1, "কুপন কোড লিখুন").max(40),
  subtotal: z.coerce.number().int().nonnegative().default(0),
});

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "ভুল অনুরোধ";
}
