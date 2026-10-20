# Pricing — Rabeya Furniture

Read date: 2026-10-19. Prices change; the date matters.

## The public pricing on the original and three alternatives

| source | free-delivery threshold (Dhaka) | Dhaka shipping | outside-Dhaka shipping | ETA Dhaka | ETA outside | source |
| --- | --- | --- | --- | --- | --- | --- |
| **Sicily (original)** | ৳500 | ৳80 | ৳150 | 1-2 working days | 3-5 working days | https://www.sicily.com.bd/delivery-policy |
| Rabeya Furniture (now) | ৳1999 | ৳80 | ৳150 | 1-2 working days | 2-5 working days | `lib/data/seed.ts:315` |
| Daraz (BD e-com, app) | ৳1000 (Free Delivery Nationwide, promo) | ৳60-৳120 by seller | ৳120-৳200 | varies | varies | https://play.google.com/store/apps/details?id=com.daraz.android |
| Rokomari (BD e-com, app) | n/a (flat ৳60 Dhaka) | ৳60 | ৳120 | 2 days | 3-5 days | https://play.google.com/store/apps/details?id=com.rokomari |
| Othoba (BD e-com, app) | promo-only, "Special Offer" banner | varies | varies | varies | varies | https://play.google.com/store/apps/details?id=com.othoba.android |

What reviewers said about price and shipping (n = 3, source:
`replica/feedback.md`):

- "The shipping cost is very high. It's like for buying something of
  1000tk you have to pay more 500 tk for shipping." (Daraz, 1★)
- "The delivery fee, platform fee, and cash handling fee on this app
  are often higher than the actual product price, making it impossible
  to buy small items." (Daraz, 2★)
- "These hidden charges should be reduced considering everyday
  buyers." (Daraz, 2★)

The third BD e-com app (Rokomari) charges ৳60 flat in Dhaka and ships
in 2 days. The 1★ review about an 8-day out-of-stock cancellation is
separate from pricing.

## What this means for the clone

The clone's ৳1999 free-delivery threshold is a worse deal than the
original's ৳500 on every product under ৳1999, and the product line
sits at ৳750-৳2499. A ৳750 orchid plus ৳80 shipping is the
"shipping > product" trap the Daraz reviewers describe. The
original's ৳500 is the right number to match, and the right number
to beat would be ৳0 (free shipping always) — but at 22 % of
revenue, that is not a price war we can win against a workshop of
this size. So:

- **Match the original's ৳500** for free delivery in Dhaka. This is
  the single cheapest, highest-impact change in the launch plan
  (`replica/fixes.md` item 1).
- **Keep ৳80 Dhaka / ৳150 outside.** This is competitive with
  Rokomari's ৳60 flat and the original's ৳80.
- **Keep the 10 % welcome coupon** (`WELCOME10`, min order ৳500).
  This is the first-order discount the original also offers.

## The pricing model

Three tiers, named by who they are for. There is no subscription —
this is a one-off home-decor shop, not SaaS.

### Tier 1 — Single piece (৳750-৳2,499)

- One hand-made home-decor item.
- ৳80 Dhaka / ৳150 outside if subtotal < ৳500.
- Free Dhaka delivery from ৳500.
- 10 % off first order with `WELCOME10`.
- Cash on delivery.
- 7-day return on unused items in original packaging.

### Tier 2 — A small room (৳2,500-৳7,999)

- 2-3 items, e.g. a flower tub + a wall stand.
- Free Dhaka delivery.
- Free outside-Dhaka delivery from ৳2,500 (matches the original's
  silence on the threshold for outside — copy and confirm in the
  customer thread).
- Same 10 % welcome coupon.
- 7-day return.

### Tier 3 — A whole house (৳8,000+)

- 4+ items.
- Free nationwide delivery.
- Priority WhatsApp thread (single named agent, not a queue).
- 7-day return, plus a 48-hour exchange on damaged items.
- Same 10 % welcome coupon, plus a 5 % "returning customer" code on
  the second order (`RABEYA05`).

## Billing complaints the product must prevent

Three of the top complaints in `replica/feedback.md` are about
billing. The clone avoids them by construction because it is COD:

- **No "I paid but they cancelled"** — the clone has no advance
  payment flow. The customer pays the courier on delivery.
- **No platform fee / cash handling fee** — shipping is one line
  item, shown on the product card, not added at checkout.
- **No subscription to forget to cancel** — there is no
  subscription.

When online payments (SSLCommerz) are added in
`replica/fixes.md` item 4, the rule is: one payment method per
order, one receipt per payment, one refund channel, no hidden
line items.

## The Stripe / bKash / Nagad products to create (deferred)

The clone uses COD today. When online payments are added, the user
creates:

- bKash Personal number (existing, in `lib/email.ts` owner
  template).
- Nagad Personal number (existing).
- SSLCommerz sandbox account (in `.env.example`).
- A 1 % "platform fee" line in the receipt, **shown on the
  product card before checkout**, not after.

The product owner (Rabeya, the founder) opens the bKash / Nagad
merchant accounts personally; the platform does not need to be a
registered merchant until monthly volume exceeds ৳200,000.

## What to change in the code now

One line, in `lib/data/seed.ts`:

```diff
-  freeDeliveryThreshold: taka(1999),
-  freeDeliveryNote: "১৯৯৯ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি",
+  freeDeliveryThreshold: taka(500),
+  freeDeliveryNote: "৫০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি (ঢাকা)",
```

That is the entire pricing change for launch. The
`replica/fixes.md` plan adds the F01-E4 test update in the same
build (use a sub-৳500 product such as a ৳350 tissue pot, or
rephrase the test to expect ৳0 when cheap ≥ ৳500).
