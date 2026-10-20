# Architecture: Rabeya Furniture (a rebuild of Sicily's storefront features)

Bengali-first, mobile-first e-commerce for a Bangladeshi home-decor /
furniture business. Guest-first **Cash on Delivery** checkout, no account
required. Rebuilt clean-room from `recon.md`; nothing of the original's code,
assets or copy is used.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web | Next.js (App Router) + TypeScript | same shape as the original, one codebase for pages + server actions, cheap on Vercel |
| styling | Tailwind + design tokens from replica-design | fast, and the token layer swaps the rebrand in one place |
| database | Postgres on Supabase | managed, RLS built in, Storage next to it |
| ORM | Drizzle | typed SQL close to the metal, easy migrations, works with the RPC/raw SQL below |
| auth | Supabase Auth (email magic link; optional phone OTP) | accounts are optional in this product, so keep them cheap to add |
| payments | **COD now**; SSLCommerz for online later | Stripe/Paddle don't serve Bangladeshi merchants; the original uses SSLCommerz, and online payment is only a "could" |
| email | Resend | order confirmation + transactional email, good deliverability |
| SMS/WhatsApp | local BD SMS gateway + WhatsApp deep links | the real confirmation channel here is a call/SMS/WhatsApp, not email |
| jobs | Vercel Cron | flash-deal expiry, notification retries, low-stock report |
| files | Supabase Storage | product images, served through Next Image |
| hosting | Vercel | zero-config Next.js deploy, preview URLs, cron |

Single tenant (one store). One database. No microservices.

## Schema

Tables: 14. Access rules: **Supabase RLS** (public catalogue readable by
anon; orders/reviews/coupons never anon-writable; guest order tracking via a
`SECURITY DEFINER` RPC requiring order number **and** phone). Full DDL in
`replica/schema.sql`.

`customers, categories, products, product_images, reviews, districts, coupons,
orders, order_items, order_status_history, wishlist_items, blog_posts,
site_settings` (+ `auth.users`).

Hard constraints the recon demanded:

- `orders.total_poisha = subtotal + shipping − discount` (check constraint) —
  the order form shows a total, the DB refuses a wrong one.
- `order_items.line_total_poisha = unit_price * qty`.
- `products.stock >= 0`; stock is decremented under `SELECT … FOR UPDATE`, so
  two shoppers can't oversell the last unit.
- `coupons.used_count <= max_uses`; increment is atomic.
- `orders.idempotency_key` unique — a double-submitted order form (slow
  network, double tap) creates one order, not two.
- `orders.phone` validated to the BD mobile format (`01[3-9]XXXXXXXX`).
- `reviews.rating` 1–5; `products.rating_avg` recomputed from visible reviews.

## API

All writes are Next.js **server actions / route handlers**; the browser never
holds the service role. Reads for the storefront are server components (SSR),
so the listing is crawlable — the original's client-only listing is a gap this
closes.

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| GET `/` | home: categories, flash deals, featured | anon | — | RSC | S01 |
| GET `/shop?category=` | listing + category filter | anon | `category` | RSC | F01, S02 |
| GET `/p/[slug]` | product detail (+ reviews, related) | anon | slug | RSC | F01/F03, S03 |
| GET `/product/[id]` | redirect to canonical `/p/[slug]` | anon | uuid | 308 | SEO |
| GET `/blog`, `/blog/[slug]` | content | anon | slug | RSC | F07, S14/S15 |
| POST `/api/orders` | **create order** (guest or signed-in), returns order_number | anon + authenticated | items[], name, phone, district_id, address, coupon_code, source, idempotency_key | `{order_number, total_poisha}` | F01, F03 |
| POST `/api/coupons/validate` | check + preview a coupon | anon | code, subtotal_poisha | `{valid, discount_poisha, reason?}` | F01/F03 |
| GET `/api/orders/track` | track by order no + phone (RPC) | anon | order_number, phone | `{order_number, status, total, created_at}` | F04 |
| POST `/api/reviews` | submit a review (rate-limited) | anon + authenticated | product_id, name, city, rating, body | `{ok}` | S03 |
| GET `/api/wishlist`, POST/DELETE | sync wishlist for signed-in users | authenticated | product_id | list / ok | F05 |
| auth: `/auth/callback`, sign-in/out | magic link / OTP session | anon | email/phone | session | S09 |
| GET `/account`, `/account/orders` | profile + own order history | authenticated (RLS) | — | RSC | S09 |
| admin: `/admin/{products,orders,categories,coupons,blog,settings}` | CRUD + fulfilment | staff role | forms | RSC + actions | S19 |

Webhooks in: **SSLCommerz IPN** (`/api/webhooks/sslcommerz`, later, when online
payment turns on) → set `payment_status`/`status`; verified by signature and
made idempotent on `payment_ref`. Webhooks out: none. WhatsApp uses click-to-
chat deep links, not the API.

Jobs (Vercel Cron):

- `flash-deals` — every 15 min: flip `is_flash_deal` off when `flash_ends_at` passes.
- `notify-orders` — every 5 min: send confirmation SMS/WhatsApp for `pending` orders, retry failures.
- `recompute-ratings` — hourly: rebuild `rating_avg` / `review_count`.
- `low-stock-report` — daily: email `stock <= low_stock_at` products.

## The parts that bite

- **Time zones:** the flash-deal countdown must end on a real instant →
  `flash_ends_at timestamptz` in UTC; render in `Asia/Dhaka` (UTC+6, no DST —
  simpler than the original's booking-app problem, but store UTC anyway).
- **Money:** integer **poisha**, never float; currency column is always `BDT`.
  Percent coupons round **down** and cap at the discount.
- **Idempotency:** order creation honours `idempotency_key`; SSLCommerz IPNs
  arrive more than once and are keyed on `payment_ref`.
- **Races:** stock decrement and coupon `used_count` are transactional
  (`FOR UPDATE`); under oversell, the order fails and the shopper is told.
- **Guest tracking privacy:** order lookup needs number **and** phone, returns
  a projection, and is rate-limited — else order numbers are enumerable.
- **Phone validation:** strict BD format; strip `+88`/spaces before storing.
- **Search:** Bengali tokenisation is weak — `pg_trgm` on `name_bn` (substring)
  rather than `tsvector`, until a Bengali text-search config is picked.
- **File limits:** product image uploads capped (e.g. 5 MB, webp) in Storage.
- **Email/SMS deliverability:** email is secondary here; SMS/WhatsApp is the
  real channel — budget per-message cost and retry.
- **Data privacy:** privacy policy page + a delete-my-data path (PDPL-style),
  matching the recon's privacy screen.

## Build order

1. **Vertical slice (ugly, end to end).** Home → shop → product → cart
   (client-side) → `POST /api/orders` (COD, no coupon) → confirmation.
   *Screens:* S01, S02, S03, S04, S05, S06. *Tables:* categories, products,
   product_images, districts, orders, order_items. *Routes:* `/`, `/shop`,
   `/p/[slug]`, `POST /api/orders`. *Seed* ~6 products + 3 categories + the
   district list. Proves SSR + RLS + COD order in one pass.
2. **Must-haves** (features.csv): stock badges, sale pricing, reviews, wishlist,
   track order (RPC), contact + live-chat, the static/info pages, mobile bottom
   nav, Bengali UI. Adds reviews, wishlist_items, blog_posts, site_settings,
   order_status_history + `notify-orders` job. *Screens:* S07–S18.
3. **Should-haves:** flash deals + countdown, coupons, related products, "order
   now" shortcut, customer gallery, benefits/box lists, blog, SEO
   (sitemap/robots/meta), accounts + order history. Adds coupons table, the
   `flash-deals`/`recompute-ratings` jobs, admin CRUD.
4. **Could-haves + fixes:** online payment via SSLCommerz (IPN webhook),
   product search, admin dashboard hardening, then whatever
   `/replica-entrepreneur` finds.

## Next step

`/replica-design` — turn the original's screens into tokens and component
specs, with original assets for the Rabeya Furniture rebrand.
