import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import * as seed from "./seed";
import type {
  BlogPost,
  Category,
  Coupon,
  CreateOrderInput,
  District,
  Order,
  OrderItem,
  Product,
  Review,
  SiteSettings,
} from "./types";
import type { ProductWithStatus, CouponResult, ShippingQuote } from "./memory";

// Postgres / Supabase implementation of the data layer. Same signatures as the
// in-memory layer, so no screen changes. Selected automatically when
// DATABASE_URL is set (see lib/data/index.ts).

const t = schema;

function toProduct(
  p: typeof t.products.$inferSelect,
  images: string[] = []
): ProductWithStatus {
  return {
    id: p.id,
    categoryId: p.categoryId,
    slug: p.slug,
    name: p.nameBn,
    tagline: p.taglineBn ?? undefined,
    description: p.descriptionBn ?? "",
    price: p.pricePoisha,
    comparePrice: p.comparePoisha ?? undefined,
    stock: p.stock,
    lowStockAt: p.lowStockAt,
    isFeatured: p.isFeatured,
    isFlashDeal: p.isFlashDeal,
    flashEndsAt: p.flashEndsAt?.toISOString(),
    benefits: p.benefits ?? [],
    boxContents: p.boxContents ?? [],
    ratingAvg: Number(p.ratingAvg),
    reviewCount: p.reviewCount,
    images,
    isActive: p.isActive,
    stockStatus: p.stockStatus,
  };
}

export async function getCategories(): Promise<Category[]> {
  const rows = await db()
    .select()
    .from(t.categories)
    .where(eq(t.categories.isActive, true))
    .orderBy(t.categories.displayOrder);
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.nameBn,
    image: c.imagePath ?? undefined,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const [c] = await db()
    .select()
    .from(t.categories)
    .where(and(eq(t.categories.slug, slug), eq(t.categories.isActive, true)))
    .limit(1);
  if (!c) return null;
  return { id: c.id, slug: c.slug, name: c.nameBn, displayOrder: c.displayOrder, isActive: c.isActive };
}

export async function getProducts(
  opts: { categorySlug?: string; featured?: boolean; flash?: boolean } = {}
) {
  const conds = [eq(t.products.isActive, true)];
  if (opts.featured) conds.push(eq(t.products.isFeatured, true));
  if (opts.flash) conds.push(eq(t.products.isFlashDeal, true));
  if (opts.categorySlug) {
    const cat = await getCategoryBySlug(opts.categorySlug);
    if (!cat) return [];
    conds.push(eq(t.products.categoryId, cat.id));
  }
  const rows = await db()
    .select()
    .from(t.products)
    .where(and(...conds))
    .orderBy(desc(t.products.createdAt));
  return rows.map((p) => toProduct(p));
}

export async function getProductBySlug(slug: string) {
  const [p] = await db()
    .select()
    .from(t.products)
    .where(and(eq(t.products.slug, slug), eq(t.products.isActive, true)))
    .limit(1);
  if (!p) return null;
  const imgs = await db()
    .select()
    .from(t.productImages)
    .where(eq(t.productImages.productId, p.id))
    .orderBy(t.productImages.sortOrder);
  return toProduct(p, imgs.map((i) => i.storagePath));
}

export async function getProductById(id: string) {
  const [p] = await db().select().from(t.products).where(eq(t.products.id, id)).limit(1);
  return p ? toProduct(p) : null;
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db().select().from(t.products).where(inArray(t.products.id, ids));
  return rows.map((p) => toProduct(p));
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const rows = await db()
    .select()
    .from(t.products)
    .where(
      and(
        eq(t.products.isActive, true),
        eq(t.products.categoryId, product.categoryId),
        ne(t.products.id, product.id)
      )
    )
    .limit(limit);
  return rows.map((p) => toProduct(p));
}

export async function getReviews(productId: string): Promise<Review[]> {
  const rows = await db()
    .select()
    .from(t.reviews)
    .where(and(eq(t.reviews.productId, productId), eq(t.reviews.isVisible, true)))
    .orderBy(desc(t.reviews.createdAt));
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    authorName: r.authorName,
    city: r.cityBn ?? undefined,
    rating: r.rating,
    body: r.bodyBn,
    isVerified: r.isVerified,
    createdAt: r.createdAt.toISOString().slice(0, 10),
  }));
}

function toDistrict(d: typeof t.districts.$inferSelect): District {
  return {
    id: d.id,
    name: d.nameBn,
    zone: d.zone,
    shippingFee: d.shippingPoisha,
    etaMinDays: d.etaMinDays,
    etaMaxDays: d.etaMaxDays,
    isActive: d.isActive,
  };
}

export async function getDistricts(): Promise<District[]> {
  const rows = await db()
    .select()
    .from(t.districts)
    .where(eq(t.districts.isActive, true));
  return rows.map(toDistrict);
}

export async function getDistrict(id: string): Promise<District | null> {
  const [d] = await db().select().from(t.districts).where(eq(t.districts.id, id)).limit(1);
  return d ? toDistrict(d) : null;
}

export function quoteShipping(district: District, subtotal: number): ShippingQuote {
  const free = subtotal >= seed.siteSettings.freeDeliveryThreshold;
  return {
    shippingFee: free ? 0 : district.shippingFee,
    freeDelivery: free,
    etaMinDays: district.etaMinDays,
    etaMaxDays: district.etaMaxDays,
  };
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const [c] = await db()
    .select()
    .from(t.coupons)
    .where(and(eq(t.coupons.code, code.trim().toUpperCase()), eq(t.coupons.isActive, true)))
    .limit(1);
  if (!c) return { valid: false, discount: 0, reason: "কুপন কোডটি সঠিক নয়" };
  if (subtotal < c.minOrderPoisha)
    return { valid: false, discount: 0, reason: "সর্বনিম্ন অর্ডার পূরণ হয়নি" };
  if (c.maxUses !== null && c.usedCount >= c.maxUses)
    return { valid: false, discount: 0, reason: "কুপনের মেয়াদ শেষ" };
  const discount =
    c.type === "percent" ? Math.floor((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
  return { valid: true, discount };
}

async function resolvedCoupon(code: string, subtotal: number) {
  const [c] = await db()
    .select()
    .from(t.coupons)
    .where(eq(t.coupons.code, code.trim().toUpperCase()))
    .limit(1);
  return c ?? null;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const key = input.idempotencyKey?.trim() || null;
  if (key) {
    const existing = await findOrderByIdempotencyKey(key);
    if (existing) return existing;
  }
  try {
    return await insertOrder(input, key);
  } catch (err) {
    // Two identical submits racing: the unique index on idempotency_key makes
    // the loser fail, so hand back the order the winner created.
    if (key && isUniqueViolation(err)) {
      const existing = await findOrderByIdempotencyKey(key);
      if (existing) return existing;
    }
    throw err;
  }
}

async function findOrderByIdempotencyKey(key: string): Promise<Order | null> {
  const [row] = await db().select().from(t.orders).where(eq(t.orders.idempotencyKey, key)).limit(1);
  return row ? orderFromRow(row) : null;
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

async function insertOrder(input: CreateOrderInput, idempotencyKey: string | null): Promise<Order> {
  const database = db();
  return database.transaction(async (tx) => {
    const [district] = await tx
      .select()
      .from(t.districts)
      .where(eq(t.districts.id, input.districtId))
      .limit(1);
    if (!district) throw new Error("ডেলিভারি জেলা নির্বাচন করুন");

    const lines: OrderItem[] = [];
    const ids = input.items.map((i) => i.productId);
    const locked = await tx
      .select()
      .from(t.products)
      .where(inArray(t.products.id, ids))
      .for("update");

    for (const line of input.items) {
      const p = locked.find((x) => x.id === line.productId);
      if (!p) throw new Error("পণ্যটি খুঁজে পাওয়া যায়নি");
      if (p.stock < line.qty) throw new Error(`"${p.nameBn}" পর্যাপ্ত স্টকে নেই`);
      lines.push({
        productId: p.id,
        name: p.nameBn,
        unitPrice: p.pricePoisha,
        qty: line.qty,
        lineTotal: p.pricePoisha * line.qty,
      });
    }
    if (lines.length === 0) throw new Error("আপনার কার্ট খালি");

    const subtotal = lines.reduce((s, i) => s + i.lineTotal, 0);
    let discount = 0;
    let couponId: string | null = null;
    let couponCode: string | undefined;
    if (input.couponCode) {
      const res = await validateCoupon(input.couponCode, subtotal);
      if (res.valid) {
        const c = await resolvedCoupon(input.couponCode, subtotal);
        if (c) {
          discount = res.discount;
          couponId = c.id;
          couponCode = c.code;
          await tx
            .update(t.coupons)
            .set({ usedCount: sql`${t.coupons.usedCount} + 1`, updatedAt: new Date() })
            .where(eq(t.coupons.id, c.id));
        }
      }
    }

    const districtDomain: District = toDistrict(district);
    const quote = quoteShipping(districtDomain, subtotal);
    const total = subtotal + quote.shippingFee - discount;

    const [{ order_number: orderNumber }] = (await tx.execute(
      sql`select 'RF-' || to_char(now(),'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text,4,'0') as order_number`
    )) as unknown as { order_number: string }[];

    const [order] = await tx
      .insert(t.orders)
      .values({
        orderNumber,
        customerId: input.customerId ?? null,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        districtId: district.id,
        address: input.address.trim(),
        paymentMethod: input.paymentMethod,
        status: "pending",
        source: input.source,
        subtotalPoisha: subtotal,
        shippingPoisha: quote.shippingFee,
        discountPoisha: discount,
        totalPoisha: total,
        couponId,
        couponCode,
        note: input.note?.trim() || null,
        idempotencyKey,
      })
      .returning();

    await tx.insert(t.orderItems).values(
      lines.map((l) => ({
        orderId: order.id,
        productId: l.productId,
        nameBn: l.name,
        unitPricePoisha: l.unitPrice,
        qty: l.qty,
        lineTotalPoisha: l.lineTotal,
      }))
    );
    await tx.insert(t.orderStatusHistory).values({ orderId: order.id, status: "pending" });

    for (const line of input.items) {
      await tx
        .update(t.products)
        .set({ stock: sql`${t.products.stock} - ${line.qty}`, updatedAt: new Date() })
        .where(eq(t.products.id, line.productId));
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      districtId: district.id,
      districtName: district.nameBn,
      address: order.address,
      paymentMethod: order.paymentMethod,
      status: order.status,
      source: order.source,
      items: lines,
      subtotal,
      shippingFee: quote.shippingFee,
      discount,
      total,
      couponCode,
      note: input.note?.trim() || undefined,
      createdAt: order.createdAt.toISOString(),
    };
  });
}

async function orderFromRow(order: typeof t.orders.$inferSelect): Promise<Order> {
  const items = await db()
    .select()
    .from(t.orderItems)
    .where(eq(t.orderItems.orderId, order.id));
  const [district] = await db()
    .select()
    .from(t.districts)
    .where(eq(t.districts.id, order.districtId))
    .limit(1);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.phone,
    districtId: order.districtId,
    districtName: district?.nameBn ?? "",
    address: order.address,
    paymentMethod: order.paymentMethod,
    status: order.status,
    source: order.source,
    items: items.map((i) => ({
      productId: i.productId ?? "",
      name: i.nameBn,
      unitPrice: i.unitPricePoisha,
      qty: i.qty,
      lineTotal: i.lineTotalPoisha,
    })),
    subtotal: order.subtotalPoisha,
    shippingFee: order.shippingPoisha,
    discount: order.discountPoisha,
    total: order.totalPoisha,
    couponCode: order.couponCode ?? undefined,
    note: order.note ?? undefined,
    createdAt: order.createdAt.toISOString(),
  };
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const [o] = await db()
    .select()
    .from(t.orders)
    .where(eq(t.orders.orderNumber, orderNumber))
    .limit(1);
  return o ? orderFromRow(o) : null;
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const rows = await db()
    .select()
    .from(t.orders)
    .where(eq(t.orders.customerId, customerId))
    .orderBy(desc(t.orders.createdAt));
  return Promise.all(rows.map((o) => orderFromRow(o)));
}

export async function trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
  const [o] = await db()
    .select()
    .from(t.orders)
    .where(and(eq(t.orders.orderNumber, orderNumber.trim()), eq(t.orders.phone, phone.trim())))
    .limit(1);
  return o ? orderFromRow(o) : null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows = await db()
    .select()
    .from(t.blogPosts)
    .where(eq(t.blogPosts.isPublished, true))
    .orderBy(desc(t.blogPosts.publishedAt));
  return rows.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.titleBn,
    excerpt: b.excerptBn ?? "",
    body: b.bodyBn ?? "",
    publishedAt: b.publishedAt ? b.publishedAt.toISOString().slice(0, 10) : "",
  }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const [b] = await db()
    .select()
    .from(t.blogPosts)
    .where(eq(t.blogPosts.slug, slug))
    .limit(1);
  if (!b) return null;
  return {
    id: b.id,
    slug: b.slug,
    title: b.titleBn,
    excerpt: b.excerptBn ?? "",
    body: b.bodyBn ?? "",
    publishedAt: b.publishedAt ? b.publishedAt.toISOString().slice(0, 10) : "",
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db()
    .select()
    .from(t.siteSettings)
    .where(eq(t.siteSettings.key, "store"));
  if (rows.length === 0) return seed.siteSettings;
  return rows[0].value as SiteSettings;
}

// re-export the coupon type so both layers share it
export type { Coupon };
