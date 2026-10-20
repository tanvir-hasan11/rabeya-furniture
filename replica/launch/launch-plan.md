# Launch plan — Rabeya Furniture

A plan that lands the first 50 real orders, not a plan that ships a
home page. The two are different.

## Before the launch (week 0)

The launch is "the first 50 orders", not the homepage going live.
The site is already live at the developer's URL. So the pre-launch
work is:

1. **Free-delivery threshold change.** `lib/data/seed.ts:315`:
   `freeDeliveryThreshold: taka(1999)` → `taka(500)`, and the
   `freeDeliveryNote` updated. This is the single highest-impact
   change in the launch (`replica/launch/pricing.md`).
2. **WhatsApp handoff template** (`replica/fixes.md` #8). A
   Bengali message, 5 lines, with the order number, the
   customer's name, the address, the total, and the courier
   name. Save as a WhatsApp Quick Reply.
3. **The owner's phone on the footer** is already a number; that
   number becomes the WhatsApp Business number for the
   "one thread per order" promise.
4. **`/about` rewritten** with the live trust dashboard
   (`replica/fixes.md` #3). It can start as static text
   ("orders today: 0, median delivery: —, response time: 6 h")
   and become a real number when orders start.
5. **Analytics live.** Vercel Analytics on the deployed app, plus
   a Sentry or Plausible project for errors. The product owner
   needs the first-week "where did the customer drop off"
   numbers before the second-week changes.
6. **Error tracking live.** `npm run build` passes; `tsc` clean.
   Wire Sentry in `app/layout.tsx` (a 5-line change).

## The waitlist (week 0 → week 1)

The original has 68 K Facebook followers and a single Instagram
account. The clone has neither yet. The waitlist fills the gap
before launch:

- A single-page `/launch` with the landing copy
  (`replica/launch/landing.md`), a phone-number field, and a
  "Reserve your first-order code" button. The code is `WELCOME10`
  with an extra 5 % for waitlist members (`WELCOME15`).
- Share the waitlist on the original's Facebook (carefully — see
  the legal note below), on the founder's personal Facebook, and
  in two BD home-decor Facebook groups
  ("ফার্নিচার বাংলাদেশ", "হোম ডেকোর BD") with the founder's
  real account.
- Goal: 200 phone numbers before the first 50 orders ship. 200
  is the threshold where the trust dashboard has something to
  show.

## Where the original's unhappy users are

The research in `replica/reviews.md` is the signal. The customers
who hated the big apps are reachable in:

- The three Play Store pages (Daraz 4.5★ / 4 M, Rokomari 4.4★
  / 46 K, Othoba 3.7★ / 2.4 K). Reply to 1★ reviews of the big
  apps, as the founder's personal account, with a one-line
  Bengali response and a link to the waitlist. Not a
  "switch today" pitch. ("I saw your review. We are a small
  Dhaka shop that ships COD with the shipping on the product
  card. If you want a 10 % first-order code, the waitlist is
  here: …"). Twenty such replies, one per day, for twenty days.
- The original's own Facebook comments (login required — not
  reachable from this device). The owner can do this from a
  personal account.
- The two home-decor Facebook groups above. A weekly post that
  is genuinely useful (e.g. "how to keep an orchid alive in
  Dhaka humidity") with the product link, not a sales pitch.

## The first 10 customers (week 1 → week 2)

The first 10 are talked to by hand. The owner calls each one on
the phone within 48 hours of delivery and asks four questions:

1. Did the piece arrive in the condition you saw in the photo?
2. Was the delivery time what the website said?
3. Was the price what the website said?
4. What would have made it better?

The answers go into a private log (`replica/launch/first-10.md`,
created in week 1). The log is the source for the first
"behind the build" blog post and the first `/about` dashboard
update.

## The first 50 customers (week 2 → week 6)

Once the first 10 have been talked to:

- The waitlist codes (`WELCOME10`, `WELCOME15`) become the
  primary traffic source.
- The Facebook groups get a weekly post.
- The owner's personal Facebook and Instagram get a daily
  product photo with a one-line story about the workshop.
- The first verified-buyer review unlocks the product review
  feature (`replica/fixes.md` #2). The review is on the
  product page within 24 hours of delivery, with the reviewer's
  district.

The 50th order triggers the first public milestone: a blog post
on `/blog` titled "50 orders, 50 lessons" with the dashboard
numbers and the four most common complaints, each answered with
a code or policy change.

## Product Hunt / Hacker News (week 6)

Both are a single post, on the same day, written by the owner:

- The PH post: "Rabeya Furniture — the home-decor shop with
  shipping on the product card". First line is the angle from
  `replica/fixes.md`. Second line is the number (the waitlist
  size, the first 50 orders, the return rate). Third line is
  the founder's name and the workshop photo. No marketing
  speak.
- The HN post (Show HN): "Show HN: A small BD e-commerce shop
  that ships COD with the price on the product card". The
  first comment from the founder is the honest sample-size
  disclaimer: 9 reviews across 3 apps, not 100, and the
  direction is what we're betting on, not the magnitude.
- Both posts link to the landing (`replica/launch/landing.md`),
  not the home.

The posts go up on a Tuesday, 14:00 BST, when BD is in the
afternoon and US tech is in the morning commute.

## Legal note (do this before the posts)

The original is "Sicily" (`replica/brand.json` avoid list).
Anything that names the original, compares, or implies a
relationship is a trademark question for a lawyer in Bangladesh.
The safe paths:

- Do not name the original in the app name, store listing,
  keywords, ads, or social bios.
- Do not run "vs Sicily" comparison pages.
- Do not DMCA / scrape / copy product photos, descriptions or
  the customer photo album from the original.
- A factual comparison page ("how we ship vs the category
  average") is a legal question. The founder's lawyer
  reads it before publish.

The waitlist post in the original's Facebook groups is
acceptable: the founder is a member of the same category
community, not impersonating the original. The post links to
the waitlist, not the original.

## Screenshot sizes (deferred — App Store Connect / Play Console)

Apple and Google both change the required sizes. The launch
artifacts do not bake the sizes; the founder uploads the
screenshots when the app store account is open, with the
size that the console asks for on the day. The screenshots to
prepare:

- 6.7" iPhone (1290 × 2796) — 3 screenshots, hero, product
  card, order confirmation.
- iPad (2048 × 2732) — 1 screenshot, the home.
- 1080 × 1920 phone (Play) — 3 screenshots, same three.
- 1920 × 1080 tablet (Play) — 1, the home.

These are taken from the live site on a real device on the
day of the upload.

## Privacy labels and the data safety form

The clone collects: name, phone, address (COD), and an
optional email. Play's data safety form:

- Data shared with third parties: none.
- Data collected: name, phone, address, optional email.
- Data encrypted in transit: yes (Vercel + Supabase).
- Data deletion on request: yes (the `customers` table has
  a soft delete, see `db/schema.ts`).

Apple's privacy labels: the same four fields, no tracking,
no third-party SDKs beyond Vercel Analytics.

## Review notes for the App Store reviewer

A demo account the reviewer can use:

- email: reviewer@rabeyafurniture.bd
- password: shared in the review notes only.

The reviewer can browse, add to cart, place a COD order with
a fake phone (`01700000000`), and see the order in
`/account`. They cannot place an online order (no merchant
account yet).

## The "done" signal

The launch is done when:

- 50 orders have been delivered.
- 10 verified-buyer reviews are on product pages.
- The `/about` dashboard has real numbers, not "—".
- The return rate is below 5 % (the original's stated rate
  is below 2 %, our ceiling is 5 %).
- The 6-hour WhatsApp reply promise has been met for 95 % of
  the first 50 orders.

If any of these is not met at the 50-order mark, the launch
pauses and the founder fixes the gap before the Product
Hunt / HN post.

## Open items

These block `/replica-deploy`:

- A registered BD domain (`.bd` or `.com.bd`) and a DNS
  record.
- A Supabase project with the migration applied.
- A Vercel project with the env vars from `.env.example`.
- The owner's bKash / Nagad merchant accounts (for the
  future online payment).
- The screenshot set (requires a real device, deferred).
- The Play Store / App Store developer accounts ($25 + $99).
