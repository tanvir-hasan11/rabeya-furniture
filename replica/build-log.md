# Build log — Rabeya Furniture

One line per screen. Stack: Next.js 15.5 (App Router) + React 19 + Tailwind.
Data layer is **fake** (module memory) with the exact signatures replica-backend
will implement, so no screen changes when the real DB lands. No git repo was
initialised here (the workspace is not a repo and commits were not requested),
so the "one commit per screen" step was skipped — note for a real run.

| ID | screen | date | status | missing / notes |
| --- | --- | --- | --- | --- |
| shell | layout, header, footer, bottom nav, providers, tokens, primitives | 2026-10-18 | done | Hind Siliguri + Inter via next/font; icons Lucide |
| S01 | home | 2026-10-18 | done | static hero (carousel not built); customer-gallery section intentionally omitted (original's photos) |
| S02 | shop | 2026-10-18 | done | server-rendered (original was client-only); empty + filter states done |
| S03 | product | 2026-10-18 | done | gallery is a single placeholder (no real photos yet); reviews, benefits, box-contents, FAQ, related, inline order all done |
| S04 | cart drawer | 2026-10-18 | done | bottom-sheet/drawer; Esc + overlay close; localStorage persisted (original `/cart` was a 404) |
| S05 | checkout | 2026-10-18 | done | empty-cart state + order summary; COD only |
| S06 | order confirmation | 2026-10-18 | done | server-rendered from order number |
| S07 | track order | 2026-10-18 | done | needs order no + phone (original allowed either); privacy win |
| S08 | wishlist | 2026-10-18 | done | empty + filled; guest localStorage |
| S09 | account | 2026-10-18 | done | real Supabase auth (`/login`, `/register`) + order history (replica-backend) |
| S10 | live chat | 2026-10-18 | done | WhatsApp/phone handoff |
| S11 | about | 2026-10-18 | done | fresh copy |
| S12 | faq | 2026-10-18 | done | native details/summary accordion |
| S13 | contact | 2026-10-18 | done | phone / WhatsApp / email / address |
| S14 | blog index | 2026-10-18 | done | 2 seed posts |
| S15 | blog post | 2026-10-18 | done | |
| S16 | delivery policy | 2026-10-18 | done | |
| S17 | return & refund | 2026-10-18 | done | |
| S18 | privacy policy | 2026-10-18 | done | |
| — | design system | 2026-10-18 | done | `/design` primitives showcase |
| — | API + SEO | 2026-10-18 | done | `/api/orders`, `/api/orders/track`, `/api/coupons/validate`, sitemap, robots |

## Harder / different than expected

- **Free-delivery threshold:** recon found the original's banner (৳১৯৯৯) and
  policy (৳৫০০) disagreeing. Resolved to **৳১৯৯৯** in one place
  (`siteSettings.freeDeliveryThreshold`); `OrderForm` mirrors it — move that to
  a shared import so there is a single source of truth.
- **Money:** kept integer **poisha** end to end; the coupon rounds down and the
  order total is recomputed server-side, never trusted from the client.
- **Cart:** built as a drawer (matching the original's behaviour where `/cart`
  404s) rather than a page.
- **Guest order tracking** deliberately requires order number **and** phone, so
  order numbers cannot be enumerated.
- **Screenshots:** none captured — no browser CDP socket this run; smoke-tested
  over HTTP instead (`replica/clone-screens/README.md`).

## Definition of done (per screen)

- every state: partial — empty + error + filled done; loading skeletons built as
  primitives but not yet wired to a streaming/loading state on every route
- 390px / 1440px: responsive classes in place, **not verified on a device**
- keyboard only: forms are native controls; drawer has Esc + focus handling;
  not fully audited
- no console errors: build is clean; not run in a live browser
- no borrowed copy: clean-room, all copy written fresh
- features.csv: updated
- screenshot for diff: blocked (no CDP)

## Backend pass (replica-backend, 2026-10-18)

- Schema + migration (`db/schema.ts`, `db/migrations/0000_init.sql`), migrator
  and seed scripts.
- `lib/data` now switches on `DATABASE_URL`: Postgres when set, in-memory demo
  data otherwise. **No screen changed** — that was the point of the fake layer.
- Real auth (Supabase email/password + optional Google), server-verified
  sessions via middleware, `/account` order history.
- zod validation + per-IP rate limits on the three write routes; Resend email
  and cron jobs with retries and a `job_events` dead-letter log.
- Verified: `tsc --noEmit` clean, `next build` green, order → 201 with
  `RF-20261018-0001`, bad phone → 422, coupon `WELCOME10` → 10% off,
  wrong-phone track → 404, 21st request → 429.

## Next

`/replica-test` — click through every flow, write the e2e plan, log bugs.
Then `/replica-diff`, `/replica-entrepreneur`, `/replica-brand`, `/replica-launch`,
`/replica-deploy`.
