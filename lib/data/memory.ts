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
import * as seed from "./seed";

// ---------------------------------------------------------------------------
// Fake data layer.
//
// Every function here has the signature the real data layer (replica-backend,
// Drizzle + Postgres) will expose. Screens call these and nothing else, so
// swapping the body for real SQL changes no screen code. Orders live in
// module memory for now; a server restart clears them.
// ---------------------------------------------------------------------------

// In Next.js dev (and some serverless targets) route handlers and server
// components can end up with separate module instances, so a plain
// `const orders: Order[] = []` here is wiped the moment the page module is
// first compiled. Anchor the store on globalThis so every instance sees the
// same array — the closest thing to a real DB that the in-memory layer can do.
type MemoryStore = {
  orders: Order[];
  byKey: Map<string, Order>;
  seq: number;
};
const g = globalThis as unknown as { __rabeyaMemory?: MemoryStore };
const store: MemoryStore = (g.__rabeyaMemory ??= {
  orders: [],
  byKey: new Map<string, Order>(),
  seq: 0,
});

const delay = () => new Promise((r) => setTimeout(r, 0));

function stockStatusOf(p: Product): "in_stock" | "low_stock" | "out_of_stock" {
  if (p.stock <= 0) return "out_of_stock";
  if (p.stock <= p.lowStockAt) return "low_stock";
  return "in_stock";
}

function withStatus(p: Product) {
  return { ...p, stockStatus: stockStatusOf(p) };
}

export type ProductWithStatus = ReturnType<typeof withStatus>;

// --- catalogue -------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  return seed.categories.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return seed.categories.find((c) => c.slug === slug && c.isActive) ?? null;
}

export async function getProducts(opts: { categorySlug?: string; featured?: boolean; flash?: boolean } = {}) {
  await delay();
  let list = seed.products.filter((p) => p.isActive);
  if (opts.categorySlug) {
    const cat = seed.categories.find((c) => c.slug === opts.categorySlug);
    list = list.filter((p) => p.categoryId === cat?.id);
  }
  if (opts.featured) list = list.filter((p) => p.isFeatured);
  if (opts.flash) list = list.filter((p) => p.isFlashDeal);
  return list.map(withStatus);
}

export async function getProductBySlug(slug: string): Promise<ProductWithStatus | null> {
  const p = seed.products.find((x) => x.slug === slug && x.isActive);
  return p ? withStatus(p) : null;
}

export async function getProductById(id: string): Promise<ProductWithStatus | null> {
  const p = seed.products.find((x) => x.id === id && x.isActive);
  return p ? withStatus(p) : null;
}

export async function getProductsByIds(ids: string[]) {
  return seed.products.filter((p) => ids.includes(p.id)).map(withStatus);
}

export async function getRelatedProducts(product: Product, limit = 4) {
  return seed.products
    .filter((p) => p.isActive && p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, limit)
    .map(withStatus);
}

export async function getReviews(productId: string): Promise<Review[]> {
  return seed.reviews.filter((r) => r.productId === productId);
}

// --- delivery & coupons ----------------------------------------------------

export async function getDistricts(): Promise<District[]> {
  return seed.districts.filter((d) => d.isActive);
}

export async function getDistrict(id: string): Promise<District | null> {
  return seed.districts.find((d) => d.id === id) ?? null;
}

export interface ShippingQuote {
  shippingFee: number;
  freeDelivery: boolean;
  etaMinDays: number;
  etaMaxDays: number;
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

export interface CouponResult {
  valid: boolean;
  discount: number;
  reason?: string;
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const c = seed.coupons.find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
  if (!c || !c.isActive) return { valid: false, discount: 0, reason: "কুপন কোডটি সঠিক নয়" };
  if (subtotal < c.minOrder) return { valid: false, discount: 0, reason: "সর্বনিম্ন অর্ডার পূরণ হয়নি" };
  if (c.maxUses !== undefined && c.usedCount >= c.maxUses)
    return { valid: false, discount: 0, reason: "কুপনের মেয়াদ শেষ" };
  const discount =
    c.type === "percent" ? Math.floor((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
  return { valid: true, discount };
}

// --- orders ----------------------------------------------------------------

function nextOrderNumber(): string {
  store.seq += 1;
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  return `RF-${ymd}-${String(store.seq).padStart(4, "0")}`;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const key = input.idempotencyKey?.trim() || null;
  if (key) {
    const existing = store.byKey.get(key);
    if (existing) return existing;
  }
  const district = await getDistrict(input.districtId);
  if (!district) throw new Error("ডেলিভারি জেলা নির্বাচন করুন");

  const items: OrderItem[] = [];
  for (const line of input.items) {
    const p = seed.products.find((x) => x.id === line.productId);
    if (!p) throw new Error("পণ্যটি খুঁজে পাওয়া যায়নি");
    if (p.stock < line.qty) throw new Error(`"${p.name}" পর্যাপ্ত স্টকে নেই`);
    items.push({
      productId: p.id,
      name: p.name,
      unitPrice: p.price,
      qty: line.qty,
      lineTotal: p.price * line.qty,
    });
  }
  if (items.length === 0) throw new Error("আপনার কার্ট খালি");

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  let discount = 0;
  let couponCode: string | undefined;
  if (input.couponCode) {
    const res = await validateCoupon(input.couponCode, subtotal);
    if (res.valid) {
      discount = res.discount;
      couponCode = input.couponCode.trim().toUpperCase();
      const c = seed.coupons.find((x) => x.code.toLowerCase() === couponCode!.toLowerCase());
      if (c) c.usedCount += 1;
    }
  }

  const quote = quoteShipping(district, subtotal);
  const total = subtotal + quote.shippingFee - discount;

  const order: Order = {
    id: `o-${Date.now()}-${store.seq}`,
    orderNumber: nextOrderNumber(),
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    districtId: district.id,
    districtName: district.name,
    address: input.address.trim(),
    paymentMethod: input.paymentMethod,
    status: "pending",
    source: input.source,
    items,
    subtotal,
    shippingFee: quote.shippingFee,
    discount,
    total,
    couponCode,
    note: input.note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  for (const line of input.items) {
    const p = seed.products.find((x) => x.id === line.productId);
    if (p) p.stock -= line.qty;
  }

  store.orders.push(order);
  if (key) store.byKey.set(key, order);
  return order;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  return store.orders.find((o) => o.orderNumber === orderNumber) ?? null;
}

// Guest orders carry no customer link, so the demo layer has no history to show.
export async function getOrdersByCustomer(_customerId: string): Promise<Order[]> {
  return [];
}

export async function trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
  return (
    store.orders.find((o) => o.orderNumber === orderNumber.trim() && o.phone === phone.trim()) ?? null
  );
}

// --- content ---------------------------------------------------------------

export async function getBlogPosts(): Promise<BlogPost[]> {
  return seed.blogPosts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return seed.blogPosts.find((b) => b.slug === slug) ?? null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return seed.siteSettings;
}
