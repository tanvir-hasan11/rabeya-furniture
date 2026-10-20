# Backend — Rabeya Furniture

State after `/replica-backend`. Recon and architecture live in `recon.md` and
`architecture.md`; the plan here is the part that is now real code.

## What landed

| Area | Where | Notes |
| --- | --- | --- |
| Schema + migration | `db/schema.ts`, `db/migrations/0000_init.sql` | tables, enums, indexes, checks, RLS, `track_order` RPC |
| DB client | `db/index.ts` | lazy postgres-js + Drizzle; nothing connects without `DATABASE_URL` |
| Migrator | `scripts/migrate.mjs` | forward-only, records applied files in `_migrations` |
| Seed | `scripts/seed.ts` | same demo catalogue as the in-memory layer, real UUIDs |
| Data layer | `lib/data/sql.ts`, `lib/data/memory.ts`, `lib/data/index.ts` | one switch on `DATABASE_URL`; screens untouched |
| Auth | `lib/supabase/{client,server}.ts`, `middleware.ts`, `/login`, `/register`, `/auth/callback`, `/account` | Supabase email+password, optional Google; session refreshed by middleware |
| Validation | `lib/validation.ts` | zod schemas on every mutating route |
| Rate limiting | `lib/ratelimit.ts` | per-IP, in-memory; swap for a shared store on multi-instance |
| Email | `lib/email.ts` | Resend, Bengali HTML, sent from your own domain |
| Jobs | `lib/jobs.ts`, `app/api/cron/*` | retries + `job_events` dead-letter log |
| Env names | `.env.example` | names only, no values |

**Data-layer switch.** `lib/data/index.ts` picks Postgres when `DATABASE_URL` is
set and the in-memory demo data otherwise. That is why the app builds and runs
with zero configuration, and why the 18 screens needed no changes.

**Galleries.** `productImages` and `reviews` are read from the DB; the review
table is the one a real buyer writes to, the products table is edited with SQL
or a dashboard until an admin UI exists.

## Running it

```bash
cp .env.example .env.local        # fill DATABASE_URL first
npm run db:migrate                # applies db/migrations/*.sql
npm run db:seed                   # demo catalogue
npm run dev
```

Without `DATABASE_URL` everything above the data layer still works: the app
serves the in-memory catalogue, auth shows a "not configured" notice, and the
order-alert email is skipped.

## Access rules (Supabase RLS)

Enabled on all 13 app tables. Catalogue (`categories`, `products`,
`product_images`, `districts`, `reviews`, `blog_posts`, `site_settings`) is
public-`select` only, filtered to active/published rows. `customers` and
`wishlist_items` are readable and writable only by their owner (`auth.uid()`).
`orders`, `order_items` and `order_status_history` have **no** anon write path —
guests order through the server route, which validates and writes with the
service role. Guest tracking goes through `track_order(order_number, phone)`, a
`security definer` function that requires **both** values, so order numbers
cannot be enumerated.

Test it: sign in as user A, then user B must get zero rows from `orders` and
`wishlist_items`.

## Security checklist

- [x] secrets only in env vars, `.env*` in `.gitignore`, nothing in client bundles
      (`NEXT_PUBLIC_*` are the only client-exposed names, and they are the anon key)
- [x] input validated on the server with zod on every route (`lib/validation.ts`)
- [x] authorisation on every read and write: RLS policies + server-side order route
- [x] rate limits on order creation (10/min), tracking (20/min), coupons (30/min)
- [x] webhooks verify signatures — **not applicable yet**: COD only, no webhook
      endpoint exists. Add SSLCommerz signature verification before enabling online payment
- [ ] uploads: size and type limits, served from a separate domain or bucket —
      no upload path yet; product images are seeded paths
- [x] no user data in URLs or logs — `job_events` stores job name, order number, error
- [x] dependencies audited — see the advisory note below
- [ ] privacy policy lists every processor — add Supabase, Resend and the host to
      `app/privacy-policy/page.tsx` before launch

## Known items

- **`npm audit`:** 2 advisories in the `postcss` bundled inside Next 15
  (GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q and follow-ups). The fix pulls
  Next 16, a breaking change — schedule it as its own step, don't force it here.
- **Rate limiter is per-process.** One instance is fine; a second instance
  doubles the effective limit. Move the bucket to Upstash/Redis behind the same
  `rateLimit()` signature when you scale out.
- **Order email recipient.** Guest checkout has no email address, so the alert
  goes to `ORDER_ALERT_EMAIL` (your inbox). Customer-facing status emails need
  an email column on `orders` or a signed-in account.
- **Build on this device.** `next build` can fail with `EINVAL … readlink` in
  `.next/server/route-cache/**/$/*.html` — the kernel here can't `stat` Next's
  symlinks. A clean build works: `mv .next /tmp/next-broken-$(date +%s)` then
  build again (`rm -rf .next` cannot remove those entries).
- **Migrations were not run against a live Postgres** in this environment; the
  DDL was cross-checked against drizzle-kit's generated SQL for `db/schema.ts`
  and both agree.

## Payments

COD only for now, matching the original during recon. `architecture.md` has the
SSLCommerz path (BDT, local gateway) with the webhook + idempotency plan; the
`orders.payment_status` / `payment_ref` columns are already in the schema and
unused. Turn it on with your own store credentials when you are ready.

## Next

`/replica-test`.
