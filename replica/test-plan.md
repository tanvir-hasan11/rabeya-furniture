# Test plan: Rabeya Furniture (clone of Sicily storefront)

Build: working tree (no git repo)  Date: 2026-10-18  Env: local, seed data
Target: the clone only. The original (sicily.com.bd) is never scripted, fuzzed
or hammered — it was read by hand during recon and is not touched here.

Flows come from `replica/recon.md` (F01–F07). Cases are numbered
`F<flow>-<type><n>` with type H = happy, E = edge, N = negative.

Legend for **auto**: `e2e` = Playwright spec in `e2e/`, `api` = exercised by
the same spec through the running app, `manual` = needs a human (email arrival,
visual, real device).

## F01 — Guest browses and orders with Cash on Delivery

Happy path: `/` → `/shop` → filter by category → product → add to cart →
open cart → `/checkout` → fill name/phone/district/address → submit →
`/order/:number` shows the order number.

| case | type | steps | expected | auto |
| --- | --- | --- | --- | --- |
| F01-H1 | happy | home → shop → category → product → add → cart → checkout → fill → confirm | `/order/RF-…` heading "অর্ডার সফল হয়েছে!" with a valid order number | e2e |
| F01-E1 | edge: empty cart | open `/checkout` with nothing in the cart | empty-cart state, no form, link to shop | e2e |
| F01-E2 | edge: cart persists | add item, reload page | cart count and drawer contents survive (localStorage) | e2e |
| F01-E3 | edge: free-delivery threshold | subtotal ≥ ৳১৯৯৯ | shipping line reads "ফ্রি", total = subtotal − discount | e2e |
| F01-E4 | edge: below threshold | subtotal < ৳১৯৯৯, Dhaka district | shipping ৳৮০ added to total | e2e |
| F01-E5 | edge: outside Dhaka | subtotal < ৳১৯৯৯, Chattogram district | shipping ৳১৫০ | e2e |
| F01-E6 | edge: coupon valid | enter `WELCOME10`, apply | 10% discount row, total drops by exactly 10% of subtotal | e2e |
| F01-E7 | edge: coupon invalid | enter `NOPE`, apply | "কুপন কোডটি সঠিক নয়", discount stays 0 | e2e |
| F01-E8 | edge: coupon min-order | `WELCOME10` under its min-order | reason shown, no discount applied | api |
| F01-E9 | edge: qty stepper | raise qty in the cart, lower to 1, try 0 | floor of 1, never 0 or negative; line total updates | e2e |
| F01-E10 | edge: two tabs | add item in tab A, open drawer in tab B | counts agree after reload (localStorage last-write wins) | manual |
| F01-E11 | edge: refresh mid-flow | fill checkout, reload before submit | cart survives, form re-empties, no order created | e2e |
| F01-E12 | edge: double submit | click confirm twice quickly | exactly one order returned; second click disabled/ignored | e2e |
| F01-E13 | edge: back button | after confirmation press back to `/checkout` | cart state consistent, no duplicate order | manual |
| F01-E14 | edge: mobile 390px | run F01-H1 at 390×844 | layout holds, bottom nav reachable, no horizontal scroll | e2e |
| F01-E15 | edge: keyboard only | tab from address to payment to submit | every control reachable and operable, visible focus | manual |
| F01-E16 | edge: screen reader labels | inspect the form | each field has a label/name; errors announced (`aria-invalid`) | e2e (axe) |
| F01-E17 | edge: emoji / accents | address "বাড়ি ১ 🏠, রোড ২" | accepted and stored verbatim | api |
| F01-E18 | edge: slow network | throttle to Slow 3G, submit | button shows loading, no double order | manual |
| F01-N1 | negative: bad phone | `01112345678` | inline "সঠিক মোবাইল নম্বর লিখুন", no order | e2e |
| F01-N2 | negative: short name | name "ক" | "আপনার নাম লিখুন", no order | e2e |
| F01-N3 | negative: no district | leave district empty | "জেলা নির্বাচন করুন", no order | e2e |
| F01-N4 | negative: short address | address "ঢাকা" | "সম্পূর্ণ ঠিকানা লিখুন", no order | e2e |
| F01-N5 | negative: qty over stock | order more than stock via the API | `409` with "পর্যাপ্ত স্টকে নেই", stock unchanged | api |
| F01-N6 | negative: server rejects bad body | POST `/api/orders` with junk | `422`, zod message, nothing written | api |
| F01-N7 | negative: rate limit | 11 order posts from one IP in a minute | 11th gets `429` | api |
| F01-N8 | negative: second user | signed-in user B opens `/account` | sees none of user A's orders | manual |

## F02 — Quick add to cart from a listing card

| case | type | steps | expected | auto |
| --- | --- | --- | --- | --- |
| F02-H1 | happy | click "কার্টে যোগ করুন" on a card | badge increments, toast "কার্টে যোগ হয়েছে", no navigation | e2e |
| F02-E1 | edge: out of stock | card for a 0-stock product | button disabled and reads "স্টক শেষ" | e2e |
| F02-E2 | edge: add twice | click the same card button twice | qty becomes 2, not two separate lines | e2e |
| F02-E3 | edge: low stock cap | add to a product with stock 2, then again | qty capped at maxStock (2) | e2e |
| F02-E4 | edge: keyboard | focus the button, press Enter | same as click | manual |

## F03 — Direct order from the product page

| case | type | steps | expected | auto |
| --- | --- | --- | --- | --- |
| F03-H1 | happy | product page → fill inline form → submit | confirmation to `/order/:number`, cart untouched | e2e |
| F03-E1 | edge: low stock | product with "Nটি বাকি" | badge shown, qty capped at stock | e2e |
| F03-E2 | edge: online disabled | try to pick "অনলাইন (শীঘ্রই)" | radio disabled, COD stays selected | e2e |
| F03-E3 | edge: coupon inline | apply `WELCOME10` in the inline form | discount row appears, total updates | e2e |
| F03-E4 | edge: double submit | submit twice | one order | e2e |
| F03-N1 | negative: bad phone | inline form with `0123456789` | inline error, no order | e2e |

## F04 — Track an order

| case | type | steps | expected | auto |
| --- | --- | --- | --- | --- |
| F04-H1 | happy | place an order, then `/track-order` with its number + phone | status card with number, status, total, items | e2e |
| F04-E1 | edge: whitespace | wrap number/phone in spaces and dashes | trimmed, still found | e2e |
| F04-E2 | edge: unknown number | well-formed but unused number | "এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি" | e2e |
| F04-E3 | edge: empty fields | submit empty | validation message, no request storm | e2e |
| F04-N1 | negative: right number, wrong phone | valid number + different phone | `404`, no data (enumerating order numbers must not work) | e2e |
| F04-N2 | negative: rate limit | 21 lookups in a minute | 21st gets `429` | api |

## F05 — Save a product to the wishlist

| case | type | steps | expected | auto |
| --- | --- | --- | --- | --- |
| F05-H1 | happy | heart a card → open `/wishlist` | product appears with price and a working link | e2e |
| F05-E1 | edge: empty | `/wishlist` with nothing saved | empty state + "কেনাকাটা শুরু করুন" | e2e |
| F05-E2 | edge: toggle off | heart again / remove in wishlist | item gone, count 0 | e2e |
| F05-E3 | edge: persists | reload after saving | still saved (localStorage) | e2e |
| F05-E4 | edge: out of stock saved | save a 0-stock product | card shows "স্টক শেষ", add-to-cart disabled | manual |
| F05-N1 | negative: other browser | second browser profile | its own empty wishlist (no shared state) | manual |

## F06 — Contact / support

| case | type | steps | expected | auto |
| --- | --- | --- | --- | --- |
| F06-H1 | happy | bottom nav "লাইভ চ্যাট" → `/live-chat` | page with WhatsApp and call actions | e2e |
| F06-E1 | edge: tel fallback | inspect the call action | `tel:` link with the store number | e2e |
| F06-E2 | edge: WhatsApp deep link | inspect the chat action | `https://wa.me/<number>` with the store number | e2e |

## F07 — Read content / policy

| case | type | steps | expected | auto |
| --- | --- | --- | --- | --- |
| F07-H1 | happy | footer link → `/delivery-policy` | policy renders with the ৳৮০/৳১৫০ zones | e2e |
| F07-E1 | edge: blog post | `/blog` → a post | article renders, back link works | e2e |
| F07-E2 | edge: unknown slug | `/blog/does-not-exist` | 404 page, not a crash | e2e |

## Cross-cutting (every flow)

| case | expected | auto |
| --- | --- | --- |
| X-CONSOLE | no console errors on any visited screen | e2e (guard) |
| X-5XX | no response ≥ 500 during any test | e2e (guard) |
| X-A11Y | axe scan clean on home, shop, product, cart, checkout, track, wishlist, login, account | e2e |
| X-SEO | `sitemap.xml` and `robots.txt` answer 200 and list real routes | api |

## Not automatable here (manual pass)

- Resend email actually arriving (order alert to `ORDER_ALERT_EMAIL`).
- Google OAuth round-trip (needs a real provider session).
- SSLCommerz online payment — not enabled; COD only.
- Two-tab and second-user isolation.
- Real device / screen reader / keyboard audit.

## Environment notes

- **Browser automation:** Playwright's bundled Chromium is a glibc build and
  cannot launch on this Alpine/musl runner (missing `g_type_register_static`,
  `atk_*`). The system `chromium` (musl) is installed instead and Playwright
  connects to it over CDP, or the suite is run by the user on a normal machine.
- **Build cache:** on this device `next build` can hit `EINVAL … readlink` in
  `.next/server/route-cache/**/$/*.html` because the kernel cannot `stat`
  Next's symlinks. Fix: `mv .next /tmp/next-broken-$(date +%s)` then rebuild
  (`rm -rf .next` cannot remove those entries).
