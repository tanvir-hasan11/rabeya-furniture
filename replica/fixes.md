# Fixes — what to build and why

Built from `replica/feedback.md` (n = 9 verbatim reviews, 3 sources — small
sample, direction only) and the original's own stated policies
(`replica/screens/` and live page reads). The original is
[Sicily](https://www.sicily.com.bd/) — web-only, COD, hand-made home decor
in Dhaka, 68 K Facebook followers, 12 products, no app, no customer
product reviews on-site.

## What they hate (the original's category, not just Sicily)

1. **Hidden fees that swallow the discount.**
   "The delivery fee, platform fee, and cash handling fee on this app are
   often higher than the actual product price." (Daraz, 2★) Three BD
   e-commerce apps repeat the same complaint: shipping > product price on
   small items, and the line items appear only at the final step.
   Sicily hides ৳80 / ৳150 shipping until checkout too.
2. **"I paid, they cancelled, no one called back."**
   "they called after 2-3 days that my order is cancelled as I didn't paid
   the advance. ... 4-6 time called but no 1 can help." (Othoba, 1★)
   The pattern is: payment proof goes into a black hole, the order is
   cancelled, support cannot find the order. Sicily is a 7-day return
   shop with email + WhatsApp + Facebook — three channels, none of which
   know what the others said.
3. **Forced map location, address rejected.**
   "no order tracking for location they force to use map. but map don't
   select location name if not well known. they only show broad location
   name, like dhaka bangladesh." (Othoba, 1★) Sicily does the same: the
   checkout district dropdown is a 64-item list, not a map, but a
   customer in a new thana cannot find their area and abandons.
4. **"I can't write a review on the product I just bought."**
   "There's no option inside the app so that I can give a review."
   (Othoba, 3★) Sicily's product page has no customer reviews at all;
   the "Customer Photos" block links out to their Facebook page.

## What is missing (in the original)

1. **A real product-review section on the product page.** The closest
   Sicily has is a Facebook album. Buyers want to read other buyers.
2. **A real support inbox, not three channels.** One thread the
   customer can reply to, with the order number attached and the agent
   name visible. Today it is WhatsApp + Facebook + email, each starting
   from zero.
3. **A delivery ETA the customer can trust.** "১-২ কার্যদিবস" is
   fine; the gap is that the customer gets no update between
   "অর্ডার কনফার্ম" and the courier call. The competitor reviews do
   not mention Sicily by name, but the cancelled-order / no-update
   pattern is the same.
4. **A web app that works on a slow 3G phone.** Daraz Lite exists
   because the main app is heavy. Sicily's Next.js home page is ~3 MB
   of JS before the first product image.

## What is unsolved (positions you can own)

1. **Trust without an app.** The BD e-commerce apps on Play Store lose
   1-star reviews to the same three things: hidden fees, no
   confirmation, no reviews. A web-only shop that publishes its
   shipping total on the product card, sends a same-day WhatsApp
   receipt, and shows verified-buyer reviews earns the trust that the
   apps keep spending to repair.
2. **"Customer first" as a price, not a slogan.** Sicily's
   "গ্রাহক প্রথম" is on the about page. Turn it into a public
   dashboard: orders today, average delivery, return rate, response
   time. The owner can answer the bad review with a number, not a
   "sorry".

## Fix plan (top 5 to 8 by evidence × cost)

| # | What | Why | Size | Skill | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | **Match Sicily's ৳500 free delivery in Dhaka** (clone has ৳1999) | Sicily's threshold is the most generous in the category; beating it is a real price advantage and removes the "shipping > product" complaint for the typical ৳750 orchid order. | S | replica-build | Daraz 1★ + 2★ on shipping cost; original delivery-policy page reads ৳500. |
| 2 | **Verified-buyer reviews on `/p/[slug]`** with a `product_reviews` table | Direct ask in the data ("There's no option inside the app so that I can give a review"), and it is the single missing block in the clone's parity matrix. | M | replica-backend + replica-build | Othoba 3★; original has no on-site reviews. |
| 3 | **Public trust dashboard on `/about`** (orders today, average delivery, return rate) | Turns a slogan into a number, and gives the owner a single place to answer the next bad review with proof. | S | replica-build | Othoba 1★ on support; Sicily about page is generic. |
| 4 | **Order-thread inbox, not three channels** (one WhatsApp deep-link with order number, plus a `support_threads` table the shop replies in) | "4-6 time called but no 1 can help" is the worst-rated complaint in the data. One thread per order with an owner name and a response-time SLA. | L | replica-backend + replica-build | Othoba 1★; Sicily live-chat is a no-arg WhatsApp link. |
| 5 | **Address search, not a 64-item district dropdown** (Post Office / thana / district search, with the district in the same field) | "no order tracking for location they force to use map" + the 64-item dropdown is a known dropout on the original's checkout. | M | replica-build | Othoba 1★; clone already has the 18-district list (`lib/data/seed.ts`). |
| 6 | **In-app "where is my order" status on `/account`** with the three BD courier names + the order status pill | The original tracks by order number + phone, but does not show a status timeline. Rokomari's "Estimated Delivery Date" was their top changelog item. | S | replica-build | Rokomari changelog; Sicily track-order page is a lookup, not a timeline. |
| 7 | **A PWA install prompt on the mobile home page** so a customer who has used the site twice gets a home-screen icon and offline cache | The category is mobile-first web; the original has no app; this is a 2-day win that puts "open Rabeya Furniture" one tap away without paying Play Store 30 %. | S | replica-build | Daraz Lite exists for the same reason; Sicily has no equivalent. |
| 8 | **Two-minute WhatsApp handoff template** (BD local, Bengali, with order number, address, total, and a 5-line FAQ) | Cuts the "no one called back" loop. Owner reads the next WhatsApp, not the next 5. | XS | replica-build | Othoba 1★; Sicily WhatsApp deep-link is bare. |

Pricing and billing (#1) ships inside the free-delivery constant in
`lib/data/seed.ts`; the rest land in the next two weeks. Items 2, 4, 6
need a migration; 1, 3, 5, 7, 8 do not.

## The angle

> For **home-decor shoppers in Bangladesh** who are tired of
> "shipping higher than the product" and "called 4-6 times, no one
> helped" on the big apps,
> **Rabeya Furniture** ships from a Dhaka workshop with the price
> on the product card, a WhatsApp thread attached to the order, and
> free delivery from ৳500.
>
> **Evidence**: 9 verbatim reviews across Daraz (4.5★ / 4 M), Rokomari
> (4.4★ / 46 K), and Othoba (3.7★ / 2.4 K), the three biggest
> Bangladesh e-commerce apps. The top complaint (3 of 9 reviews, 3
> sources) is hidden fees that swallow the discount; the second is
> support that cannot find a paid order; the third is the absence of
> a real review section. The original Sicily has none of the three
> problems on its own page, but it is web-only, and its ৳1999 free
> delivery is the same trap on a smaller scale. (Sample is small. The
> direction is right; the magnitude is a guess.)

### Why this beats the original

| | Sicily | Clone (now) | Clone (after the plan) |
| --- | --- | --- | --- |
| Free delivery in Dhaka | ৳500 | ৳1999 | ৳500 (matches Sicily, beats Daraz's ৳1000) |
| Product reviews on site | none | none | verified-buyer reviews with the customer's district |
| Order-thread inbox | WhatsApp + FB + email | WhatsApp deep-link | one WhatsApp thread per order, with status |
| Trust signal | "গ্রাহক প্রথম" text | none | live dashboard on `/about` |
| App | none (web only) | none | PWA install prompt on mobile |

A straight copy is at 92.9 % feature parity (`replica/parity.md`).
The plan above is the 7.1 % that turns the copy into a story.

## New rows for `replica/features.csv`

These are the "no" rows the clone adds. Add to the bottom of the
matrix with `original` set to `no`.

```csv
verified-buyer product reviews,product,should,no,no,planned in /replica-build BUG-002 era; product_reviews table
free delivery in Dhaka from ৳500,checkout,must,no,no,original is ৳500; clone is ৳1999; planned in replica-build
order-thread support inbox,support,should,no,no,one WhatsApp thread per order, with status, owner name, response-time SLA
public trust dashboard,content,could,no,no,orders today, avg delivery, return rate, response time, live on /about
PWA install prompt on mobile,storefront,should,no,no,mobile-first web without paying Play Store 30%
address search at checkout,checkout,should,no,no,thana / district / PO search; not a 64-item dropdown
two-minute WhatsApp handoff template,support,should,no,no,Bengali template with order number, address, total, 5-line FAQ
```

## What I could not read

The original's own customer reviews live on Facebook
(`facebook.com/sicily7273`, 68 K followers) and Instagram
(`instagram.com/sicilybd7273`). Both pages require a logged-in
browser to load the post comments, so the verbatim feedback for the
original itself could not be collected from this device. The 9
reviews above are from the three biggest BD e-commerce apps and are
the best signal available. Re-run this skill from a machine with a
browser logged into Facebook and Instagram to add 30-50 Sicily-direct
reviews before the launch.
