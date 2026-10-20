// Domain types for Rabeya Furniture.
// Money is integer poisha (1 BDT = 100 poisha). IDs are strings.

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type DeliveryZone = "inside_dhaka" | "outside_dhaka";
export type PaymentMethod = "cod" | "online";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
export type OrderSource = "cart" | "direct";
export type CouponType = "percent" | "fixed";

export interface Category {
  id: string;
  slug: string;
  name: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  price: number; // poisha
  comparePrice?: number; // poisha
  stock: number;
  lowStockAt: number;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashEndsAt?: string; // ISO
  benefits: string[];
  boxContents: { title: string; subtitle?: string }[];
  ratingAvg: number;
  reviewCount: number;
  images: string[];
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  city?: string;
  rating: number;
  body: string;
  isVerified: boolean;
  createdAt: string;
}

export interface District {
  id: string;
  name: string;
  zone: DeliveryZone;
  shippingFee: number; // poisha
  etaMinDays: number;
  etaMaxDays: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // percent points or poisha
  minOrder: number; // poisha
  maxUses?: number;
  usedCount: number;
  activeFrom?: string;
  activeTo?: string;
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number; // poisha
  qty: number;
  lineTotal: number; // poisha
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  districtId: string;
  districtName: string;
  address: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  source: OrderSource;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  note?: string;
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  facebook: string;
  instagram: string;
  freeDeliveryThreshold: number; // poisha
  freeDeliveryNote: string;
  announcement: string;
  announcementCode: string;
}

export interface CreateOrderInput {
  customerId?: string; // set when the shopper is logged in
  customerName: string;
  phone: string;
  districtId: string;
  address: string;
  paymentMethod: PaymentMethod;
  items: { productId: string; qty: number }[];
  couponCode?: string;
  note?: string;
  /** Client-generated key so a double-submit returns the same order instead of creating two. */
  idempotencyKey?: string;
  source: OrderSource;
}
