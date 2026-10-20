import { hasDatabase } from "@/db";
import * as memory from "./memory";
import * as sql from "./sql";

// Data-layer switch. Screens import from "@/lib/data" only, so the backing
// store is a single decision made here: Postgres/Supabase when DATABASE_URL is
// set, otherwise the in-memory demo data (so the app runs with no setup).

type Layer = typeof memory;
const impl: Layer = hasDatabase() ? (sql as unknown as Layer) : memory;

export type { ProductWithStatus } from "./memory";
export type { ShippingQuote, CouponResult } from "./memory";
export * from "./types";

export const getCategories = impl.getCategories;
export const getCategoryBySlug = impl.getCategoryBySlug;
export const getProducts = impl.getProducts;
export const getProductBySlug = impl.getProductBySlug;
export const getProductById = impl.getProductById;
export const getProductsByIds = impl.getProductsByIds;
export const getRelatedProducts = impl.getRelatedProducts;
export const getReviews = impl.getReviews;
export const getDistricts = impl.getDistricts;
export const getDistrict = impl.getDistrict;
export const quoteShipping = impl.quoteShipping;
export const validateCoupon = impl.validateCoupon;
export const createOrder = impl.createOrder;
export const getOrderByNumber = impl.getOrderByNumber;
export const getOrdersByCustomer = impl.getOrdersByCustomer;
export const trackOrder = impl.trackOrder;
export const getBlogPosts = impl.getBlogPosts;
export const getBlogPostBySlug = impl.getBlogPostBySlug;
export const getSiteSettings = impl.getSiteSettings;
