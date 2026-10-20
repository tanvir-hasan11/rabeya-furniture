# Recon map: Sicily (Web, Next.js — mobile-first e-commerce)

Scope: Full storefront — browse → product → cart → COD checkout → order
confirmation/track, plus wishlist, account, blog and the static/info pages.
For: The user's own business (Rabeya Furniture, a home decor / furniture store).
Date: 2026-10-18

Method note: read clean-room from public pages only. The site is a Next.js
app; product/category data loads client-side behind `/api` (which the site's
own `robots.txt` disallows). No JS bundles, network calls or private APIs were
read. Everything below is inferred from rendered pages and public content.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | home | https://www.sicily.com.bd/ | hero slider, category tiles, flash deals + countdown, promo banners, featured products, customer gallery, footer |
| 2 | shop listing | https://www.sicily.com.bd/shop | product grid; content is client-rendered (only header/footer in raw HTML) |
| 3 | category listing | https://www.sicily.com.bd/shop?category=flower-tub (also `tree-plant`, `wall-stand`) | same listing filtered by category |
| 4 | product (uuid route) | https://www.sicily.com.bd/product/4719726e-29a1-4b2a-8577-0fd933ecd3ae | full product page + inline order form |
| 5 | product (pretty route) | https://www.sicily.com.bd/p/pushponibash-2 | same page via SEO slug |
| 6 | checkout | https://www.sicily.com.bd/checkout | order/billing form; empty-cart state |
| 7 | track order | https://www.sicily.com.bd/track-order | lookup by order number or phone |
| 8 | wishlist | https://www.sicily.com.bd/wishlist | empty state seen |
| 9 | account | https://www.sicily.com.bd/account | login/profile entry |
| 10 | live chat | https://www.sicily.com.bd/live-chat | WhatsApp handoff page |
| 11 | about | https://www.sicily.com.bd/about | brand story, 4 value props |
| 12 | faq | https://www.sicily.com.bd/faq | 5 Q&A |
| 13 | contact | https://www.sicily.com.bd/contact | phone / WhatsApp / email / address |
| 14 | blog index | https://www.sicily.com.bd/blog | 2 posts |
| 15 | blog post | https://www.sicily.com.bd/blog/flowers-home-decoration-tips | article layout |
| 16 | delivery policy | https://www.sicily.com.bd/delivery-policy | zones, fees, ETA |
| 17 | return & refund | https://www.sicily.com.bd/return-refund | return rules, refund process |
| 18 | privacy policy | https://www.sicily.com.bd/privacy-policy | data use |
| 19 | sitemap.xml | https://www.sicily.com.bd/sitemap.xml | full route list + product slugs |
| 20 | robots.txt | https://www.sicily.com.bd/robots.txt | `Disallow: /admin`, `/api` |
| 21 | pricing / payments | product + checkout pages | COD default, "online (coming soon)", SSLCommerz badge in footer |
| 22 | own account | not driven in a browser this run | would add signed-in states (see Gaps) |

## Core loop

A shopper browses the home/shop grid, opens a product, adds it to the cart (or
orders straight from the product form), and checks out as a **guest with Cash
on Delivery** — name + phone + district + address — after which a rep calls to
confirm. No account and no upfront payment required.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Home | `/` | merchandising / entry | announcement bar, hero carousel, category tiles, flash-deal row + countdown, promo banners (WELCOME10, free delivery), product rows, customer gallery, footer, bottom nav | filled (only state; data is server+client mix) |
| S02 | Shop / listing | `/shop`, `/shop?category=` | browse & filter | breadcrumb, category filter, product grid, product card (image, name, price, compare-at, discount %, stock badge, add-to-cart), "see all" | filled; empty + loading not observed (client-rendered) |
| S03 | Product detail | `/product/:uuid`, `/p/:slug` | convert | promo strip, image gallery, title, tagline, rating, price + compare-at + discount + stock, qty stepper, add-to-cart, direct-order, description, customer gallery, benefits list, box-contents list, rating summary + review cards, inline order form, FAQ, related products, sticky mobile price + "order now", back-to-shop | filled; out-of-stock / low-stock ("N baki") variants |
| S04 | Cart | slide-over from bottom nav "কার্ট" (`/cart` is not a route — 404) | review basket | line items, qty stepper, remove, subtotal, checkout CTA, empty state | empty + filled (inferred) |
| S05 | Checkout | `/checkout` | place order | billing/order form, order summary, coupon field, shipping calc, total, confirm button | empty-cart state seen; filled inferred |
| S06 | Order confirmation | after submit (inferred) | reassure + order id | success message, order number, summary | inferred, not publicly reachable |
| S07 | Track order | `/track-order` | post-purchase lookup | single input (order no / phone), track button, login link | default / result / not-found (inferred) |
| S08 | Wishlist | `/wishlist` | save for later | saved product grid, empty state | empty seen; filled inferred |
| S09 | Account / login | `/account` | returning customer | auth (login/register), profile, order history | logged-out seen; logged-in inferred |
| S10 | Live chat | `/live-chat` | support | agent avatars, copy, "chat on WhatsApp" + "call" buttons, 3 trust points | default |
| S11 | About | `/about` | trust | story + 4 value cards | static |
| S12 | FAQ | `/faq` | pre-sale answers | accordion / Q&A list | static |
| S13 | Contact | `/contact` | support | phone / WhatsApp / email / address cards, socials | static |
| S14 | Blog index | `/blog` | content / SEO | post cards (date, title, excerpt, read link) | 2 posts |
| S15 | Blog post | `/blog/:slug` | content / SEO | date, title, body, back link | static |
| S16 | Delivery policy | `/delivery-policy` | policy | 4 info blocks + caveat | static |
| S17 | Return & refund | `/return-refund` | policy | eligible/ineligible lists, refund process | static |
| S18 | Privacy policy | `/privacy-policy` | policy / legal | 4 sections + contact | static |
| S19 | Admin | `/admin` | ops back-end | (disallowed by robots; not inspected) | — out of scope |

Shared chrome on every screen: header (logo, wishlist icon), announcement bar,
footer (category links, info links, contact, socials, SSLCommerz badge,
copyright), and a **mobile bottom nav**: হোম / শপ / কার্ট / লাইভ চ্যাট / প্রোফাইল.
Site language is Bengali (bn), prices in ৳.

## Flows

```
F01 Guest browses and orders with Cash on Delivery
    S01 -> S02 (optionally filter by category) -> S03 -> add to cart -> S04
        -> S05 checkout (name, phone, district, address, COD) -> S06 confirmation
    happy path clicks: ~7 (home → category/product → add → open cart → checkout → fill → confirm)
    edge: out-of-stock, low-stock ("N baki"), coupon applied, free-delivery threshold,
          district outside Dhaka (৳150 vs ৳80), empty cart, invalid phone

F02 Quick add to cart from a listing card
    S02 (or S01) -> "কার্টে যোগ করুন" -> cart badge increments (no navigation)
    happy path clicks: 1
    edge: out-of-stock product, double tap

F03 Direct order from the product page form
    S03 -> fill inline order form -> S03 order confirmed
    happy path clicks: ~5 (no separate cart/checkout page)
    edge: low stock, COD vs "online (soon)", coupon

F04 Track an order
    S07 -> enter order number or phone -> result
    happy path clicks: 2
    edge: not found, phone without country code

F05 Save a product to the wishlist
    S02/S03 -> heart -> S08 wishlist
    happy path clicks: 1–2
    edge: empty wishlist

F06 Contact / support
    bottom nav "লাইভ চ্যাট" -> S10 -> WhatsApp or call
    happy path clicks: 2
    edge: WhatsApp not installed (tel: fallback)

F07 Read content / policy
    link in footer -> S15/S12/S16/S17/S18
    happy path clicks: 1
    edge: none
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Header | desktop/mobile | scrolled, default | all |
| Announcement / promo strip | offer, shipping, limited-time | — | S01, S03 |
| Bottom nav (mobile) | 5 tabs, cart badge | active/inactive | all |
| Hero carousel | slides | auto-advance | S01 |
| Category tile | 1 active ("all") + per category | active/inactive | S01, S02 |
| Countdown timer | flash deals | ticking | S01 |
| Product card | grid, row/carousel | in-stock, low-stock, out-of-stock, discounted | S01, S02, S08, related |
| Price block | sale (compare-at + %), plain | — | cards, S03 |
| Stock badge | "স্টকে আছে", "Nটি বাকি", out | — | cards, S03 |
| Add-to-cart button | primary, small (card) | default/disabled | S01–S03 |
| Quantity stepper | product, cart line | min/max, disabled | S03, S04 |
| Rating stars | display (5) | partial | S03 |
| Review card | verified buyer | — | S03 |
| Image gallery | product | + thumbnails | S03 |
| Benefit / box-content list | icon + title + subtitle | — | S03 |
| Order form | inline (S03) & checkout (S05) | idle, submitting, error | S03, S05 |
| District select | 17 districts | — | S03, S05 |
| Payment method | COD (Radio), online (disabled/"soon") | selected | S03, S05 |
| Coupon field | input + apply | valid/invalid | S03, S05 |
| Order summary | subtotal, shipping, total | — | S03, S04, S05 |
| FAQ accordion | list | open/closed | S03, S12 |
| WhatsApp float / CTA | — | — | S10, S13 |
| Footer | 4 columns | — | all |
| Toast / inline notice | added-to-cart, errors | auto-dismiss | S01–S05 |
| Empty state | cart, wishlist, checkout, search | — | S04, S05, S08 |

## Inferred data model

```
Product    id (uuid), slug, name (bn), short_tagline, description,
           price, compare_price, discount_pct, stock (int), stock_status,
           is_flash_deal, is_featured, category_id, images[], benefits[],
           box_contents[], rating_avg, review_count, status, created_at
           evidence: S01/S03, sitemap.xml (p/:slug), stock badges, benefits/box lists
           confidence: high

Category   id, name (bn), slug (flower-tub | tree-plant | wall-stand),
           display_order, image
           evidence: S01 category tiles, S02 ?category=, sitemap
           confidence: high

Order      id, order_number, customer_name, phone, district, address,
           payment_method (cod | online), subtotal, shipping_fee,
           coupon_code, discount, total, status, source (cart | direct),
           created_at
           evidence: S03 inline form, S05 checkout, S07 track-order
           confidence: high

OrderItem  id, order_id, product_id, name, unit_price, qty, line_total
           evidence: cart lines, order summary
           confidence: high

Customer   id, name, phone, email, password_hash, created_at
           relationships: Customer 1-n Order
           evidence: S09 /account (login + order history)
           confidence: medium

Review     id, product_id, author_name, city, rating (1-5), text,
           is_verified, created_at
           evidence: S03 "ভেরিফাইড ক্রেতা" review cards
           confidence: high

Wishlist   id, visitor/customer_id, product_id, created_at
           evidence: S08 /wishlist (works without login → keyed by session/localStorage)
           confidence: medium

Coupon     code (e.g. WELCOME10), type (percent), value, min_order,
           active_from, active_to, usage_limit
           evidence: S01 banner "WELCOME10", coupon field on S03/S05
           confidence: medium

District   id, name (bn), zone (inside_dhaka | outside_dhaka),
           shipping_fee, eta_days
           evidence: S03 district select, S16 delivery policy (৳80 / ৳150)
           confidence: high

BlogPost   id, slug, title, excerpt, body, published_at
           evidence: S14/S15
           confidence: high

SiteSetting/Page  free_delivery_threshold (৳1999 banner vs ৳500 policy — see Gaps),
           phone, email, whatsapp, address, socials, policy copy
           evidence: footer, S01 banners, S13, S16-S18
           confidence: medium
```

Relationships: Category 1-n Product; Product 1-n Review; Order 1-n OrderItem;
Customer 1-n Order; Product n-n Wishlist; Coupon 1-n Order.

## Feature matrix

See `features.csv`. Must: 20, should: 9, could: 4, skip: 2.

## Out of scope (cannot or should not be cloned)

- **Sicily's brand** — name, logo, colour, product photography, tagline and
  Bengali marketing copy. Reference only; the clone is rebranded (Rabeya
  Furniture).
- **Product photography / content** — the shop's own images and product copy
  are theirs. The clone needs its own catalogue and photos.
- **Admin back-end** (`/admin`) — not inspected (robots-disallowed) and not
  part of the public product; the clone builds its own admin.
- **Their API** (`/api`) — hashed, not read.
- The **SSLCommerz** merchant account and the Facebook/Instagram customer
  gallery — third-party/network assets.
- Live customer reviews shown are that store's; the clone needs real ones.

## Gaps & contradictions (flag before building)

- **Free-delivery threshold conflicts:** home banner says free delivery over
  ৳১৯৯৯, delivery policy says ৳৫০০ for inside Dhaka. Resolve to one rule.
- **Cart route:** `/cart` 404s; the cart is a client-side slide-over, not a
  page. Confirm the intended cart UX.
- **"Online" payment is disabled** ("শীঘ্রই"/soon) — checkout is effectively
  COD-only today.
- **Stock wording:** "স্টকে আছে" vs "Nটি বাকি" vs out — need a numeric stock
  field and low-stock threshold.
- **No visible search box** on the shop in the reads — confirm whether search
  is a feature or intentionally absent.
- **Screenshots not captured this run:** the in-app Guest Browser exposed no
  WebView devtools socket, so the live click-through and `replica/screens/`
  captures could not be taken. Re-run with the browser connected to fill these.

## Size

Screens 18 (public) + confirmation, flows 7, entities 11. Hard parts: a real
COD order pipeline with confirmation (call/SMS/WhatsApp), cart persistence for
guests, coupon + district-shipping rules, an admin to manage products/orders,
and image handling. Size: **M–L** (a few weeks to a quarter) for a solid,
sellable storefront on real data; **S** if built as a thin COD-first slice.
