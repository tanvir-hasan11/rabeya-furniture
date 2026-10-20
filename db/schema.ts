import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  smallint,
  boolean,
  numeric,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Mirrors replica/schema.sql. Money is integer poisha; times are timestamptz.

export const stockStatus = pgEnum("stock_status", ["in_stock", "low_stock", "out_of_stock"]);
export const paymentMethod = pgEnum("payment_method", ["cod", "online"]);
export const paymentStatus = pgEnum("payment_status", ["unpaid", "paid", "refunded", "failed"]);
export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);
export const orderSource = pgEnum("order_source", ["cart", "direct"]);
export const couponType = pgEnum("coupon_type", ["percent", "fixed"]);
export const deliveryZone = pgEnum("delivery_zone", ["inside_dhaka", "outside_dhaka"]);

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey(), // references auth.users(id)
  fullName: text("full_name"),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameBn: text("name_bn").notNull(),
  imagePath: text("image_path"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    nameBn: text("name_bn").notNull(),
    taglineBn: text("tagline_bn"),
    descriptionBn: text("description_bn"),
    pricePoisha: integer("price_poisha").notNull(),
    comparePoisha: integer("compare_poisha"),
    stock: integer("stock").notNull().default(0),
    lowStockAt: integer("low_stock_at").notNull().default(5),
    stockStatus: stockStatus("stock_status").notNull().default("in_stock"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isFlashDeal: boolean("is_flash_deal").notNull().default(false),
    flashEndsAt: timestamp("flash_ends_at", { withTimezone: true }),
    benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
    boxContents: jsonb("box_contents").$type<{ title: string; subtitle?: string }[]>().notNull().default([]),
    ratingAvg: numeric("rating_avg", { precision: 2, scale: 1 }).notNull().default("0"),
    reviewCount: integer("review_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxCat: index("products_category_id_idx").on(t.categoryId),
    idxActive: index("products_active_idx").on(t.isActive, t.createdAt),
    stockCheck: check("products_stock_check", sql`${t.stock} >= 0`),
    priceCheck: check("products_price_check", sql`${t.pricePoisha} >= 0`),
  })
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    altBn: text("alt_bn"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ idx: index("product_images_product_idx").on(t.productId, t.sortOrder) })
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    cityBn: text("city_bn"),
    rating: smallint("rating").notNull(),
    bodyBn: text("body_bn").notNull(),
    isVerified: boolean("is_verified").notNull().default(false),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idx: index("reviews_product_idx").on(t.productId, t.createdAt),
    ratingCheck: check("reviews_rating_check", sql`${t.rating} between 1 and 5`),
  })
);

export const districts = pgTable("districts", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameBn: text("name_bn").notNull().unique(),
  zone: deliveryZone("zone").notNull(),
  shippingPoisha: integer("shipping_poisha").notNull(),
  etaMinDays: integer("eta_min_days").notNull().default(1),
  etaMaxDays: integer("eta_max_days").notNull().default(4),
  isActive: boolean("is_active").notNull().default(true),
});

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  type: couponType("type").notNull(),
  value: integer("value").notNull(),
  minOrderPoisha: integer("min_order_poisha").notNull().default(0),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  activeFrom: timestamp("active_from", { withTimezone: true }),
  activeTo: timestamp("active_to", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    districtId: uuid("district_id")
      .notNull()
      .references(() => districts.id, { onDelete: "restrict" }),
    address: text("address").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull().default("cod"),
    paymentStatus: paymentStatus("payment_status").notNull().default("unpaid"),
    currency: text("currency").notNull().default("BDT"),
    paymentRef: text("payment_ref").unique(),
    status: orderStatus("status").notNull().default("pending"),
    source: orderSource("source").notNull().default("cart"),
    subtotalPoisha: integer("subtotal_poisha").notNull(),
    shippingPoisha: integer("shipping_poisha").notNull(),
    discountPoisha: integer("discount_poisha").notNull().default(0),
    totalPoisha: integer("total_poisha").notNull(),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    couponCode: text("coupon_code"),
    note: text("note"),
    idempotencyKey: text("idempotency_key").unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxPhone: index("orders_phone_idx").on(t.phone, t.createdAt),
    idxStatus: index("orders_status_idx").on(t.status, t.createdAt),
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    nameBn: text("name_bn").notNull(),
    unitPricePoisha: integer("unit_price_poisha").notNull(),
    qty: integer("qty").notNull(),
    lineTotalPoisha: integer("line_total_poisha").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ idxOrder: index("order_items_order_idx").on(t.orderId) })
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatus("status").notNull(),
    noteBn: text("note_bn"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ idx: index("order_status_history_order_idx").on(t.orderId, t.createdAt) })
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ uniq: uniqueIndex("wishlist_items_unique").on(t.customerId, t.productId) })
);

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  titleBn: text("title_bn").notNull(),
  excerptBn: text("excerpt_bn"),
  bodyBn: text("body_bn"),
  coverPath: text("cover_path"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Dead-letter log for background jobs (not in the original schema.sql — added
// so failed notifications/reminders are never silently dropped).
export const jobEvents = pgTable("job_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  job: text("job").notNull(),
  ref: text("ref"),
  status: text("status").notNull(), // ok | failed
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
