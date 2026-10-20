# Landing page — Rabeya Furniture

Built around the angle from `replica/fixes.md`. Bengali-first
because the customer, the product, and the workshop are all
Bengali; English is a second column, not the lead. The page is
written to replace the current `/` (`app/page.tsx`) when the
landing ships. The current home is the e-commerce home; the
landing is the marketing version. Both live — the landing on
`/landing` (or a marketing subdomain) and the shop on `/`.

## 1. Hero

> **হাতে তৈরি হোম ডেকোর, যেটা কেনার পরে ভুলে যাবেন না।**
> *Hand-made home decor you'll remember after the box is gone.*
>
> [কেনাকাটা শুরু করুন](#shop) &nbsp;·&nbsp; [ফ্রি ডেলিভারি কীভাবে কাজ করে](#pricing)

Hero screenshot: a single product card on a charcoal-stone
background, photographed at 12 o'clock daylight on the workshop
table — the same light the customer will read the product in. No
stock-photo sofa, no model home, no staged kitchen.

## 2. The problem

> **আপনি কি অনলাইনে ফুলদানি কিনে ঠকেছেন? আপনি একা নন।**
> *Have you been let down by an online decor order? You are not
> alone.*
>
> The three biggest e-commerce apps in Bangladesh share three
> problems in their 1-star reviews:
>
> 1. **Shipping higher than the product.** A ৳1,000 order carries
>    ৳500 of platform, delivery and "cash handling" fees added at
>    the last step. The discount was real; the receipt was not.
> 2. **"I called four times, no one helped."** A payment goes into
>    a black hole, the order is cancelled, and the call centre
>    cannot find the order.
> 3. **"I cannot write a review on the product I just bought."**
>    There is no review box on the product page. There is no way
>    to know if the next customer got what you got.
>
> We do the three things differently. The shipping total is on the
> product card. The order has a single WhatsApp thread with a name
> and a response-time promise. And the product page has a
> verified-buyer review section, with the reviewer's district.

(Paraphrased from `replica/feedback.md`; no reviewer is quoted
on the landing page. The original's reviews are research, not
testimonials.)

## 3. How it works

> **তিনটা ধাপে অর্ডার।**
> *Three steps to an order.*

1. **পছন্দ করুন।** *Pick.* Browse the shop, add a piece to the
   cart. The price on the card is the price you pay, plus the
   shipping on the same line.
2. **ফর্মটা পূরণ করুন।** *Fill the form.* Name, phone, thana,
   full address. We text you a copy of your order on WhatsApp
   before the courier leaves the workshop.
3. **হাতে পেয়ে টাকা দিন।** *Pay when you get it.* The courier
   hands you the piece. You check it. You pay. If the box is
   damaged, you refuse and the order is replaced free.

(Three steps from F01 in `replica/test-plan.md`.)

## 4. Features (each tied to a fix)

> **আমরা যা করি, এবং কেন।**
> *What we do, and why.*

- **Shipping on the product card, not at the end.**
  *Why:* the most-complained-about thing on the big apps is the
  fee that appears at the final step. We put the total on the
  card so the price you see is the price you pay. (`fixes.md`
  #1, free delivery in Dhaka from ৳500.)
- **One WhatsApp thread per order, with a name.**
  *Why:* the worst reviews on the big apps are about support
  that cannot find a paid order. Your order has a single thread
  on the same number, with the courier's name, the workshop
  manager's name, and a 6-hour response-time promise during
  business hours. (`fixes.md` #4.)
- **Verified-buyer reviews with the reviewer's district.**
  *Why:* the third most-complained-about thing on the big apps
  is "I cannot write a review on the product I just bought". The
  product page has a reviews tab, and only buyers can post.
  (`fixes.md` #2.)
- **A live trust dashboard on `/about`.**
  *Why:* the owner's promise should be a number, not a slogan.
  `/about` shows orders today, the median delivery time, the
  return rate, and the response time on the support thread.
  (`fixes.md` #3.)
- **Thana / district search, not a 64-item dropdown.**
  *Why:* the 64-item district dropdown at checkout is the
  biggest reason a new customer abandons the cart. We replaced
  it with a search box. (`fixes.md` #5.)
- **7-day return, on a real policy.**
  *Why:* the original promises 7 days. We do too, and the
  policy is in plain Bengali on `/return-refund`, not a legal
  PDF. (Parity feature.)
- **Cash on delivery, no advance, no platform fee.**
  *Why:* the most-complained-about thing on the big apps is
  "I paid but they cancelled". We do not take your money until
  the piece is in your hand. (Parity feature.)

## 5. Pricing

> **সাধারণ দাম। লুকোনো ফি নেই।**
> *Honest prices. No hidden fees.*

| | Single piece | Small room | Whole house |
| --- | --- | --- | --- |
| Order total | ৳750-৳2,499 | ৳2,500-৳7,999 | ৳8,000+ |
| Dhaka delivery | ৳80 (free from ৳500) | free | free |
| Outside Dhaka | ৳150 (free from ৳2,500) | free | free |
| First-order coupon | `WELCOME10` (10 % off) | same | same |
| Returning-customer | — | — | `RABEYA05` (5 % off) |
| Return window | 7 days | 7 days | 7 days, 48-hour exchange |
| Support | WhatsApp, 6-hour reply | same | single named agent |

See `replica/launch/pricing.md` for the model and the source for
each number.

## 6. FAQ

> **আপনার মনে যা আসতে পারে।**
> *What you might be wondering.*

**আপনারা কি সারা বাংলাদেশে ডেলিভারি দেন?**
*Do you deliver nationwide?*
হ্যাঁ। ঢাকায় ১-২ কার্যদিবস, ঢাকার বাইরে ২-৫ কার্যদিবস। ৫০০
টাকার বেশি অর্ডারে ঢাকায় ফ্রি।
*Yes. 1-2 working days in Dhaka, 2-5 outside. Free in Dhaka
from ৳500.*

**পণ্য হাতে পাওয়ার আগে কি টাকা দিতে হবে?**
*Do I have to pay before I get the product?*
না। ক্যাশ অন ডেলিভারি। কুরিয়ার হাতে দিলে তখন টাকা দেবেন।
*No. Cash on delivery. You pay the courier when the product is
in your hand.*

**পণ্য ভাঙা বা ভুল আসলে কী হবে?**
*What if the product is damaged or wrong?*
৭ দিনের মধ্যে অব্যবহৃত পণ্য ফেরত দিলে সম্পূর্ণ টাকা ফেরত
(bKash / Nagad / ব্যাংক)। ডেলিভারির সময় ক্ষতিগ্রস্ত মনে হলে
রিসিভ না করেই ফেরত পাঠান।
*Return within 7 days in original packaging for a full refund
(bKash / Nagad / bank). Refuse the delivery if the box is
damaged.*

**রিভিউ কি শুধু ক্রেতারা লিখতে পারবেন?**
*Can only buyers write reviews?*
হ্যাঁ। অর্ডার যারা করেছেন এবং ডেলিভারি নিয়েছেন, শুধু তারাই
রিভিউ লিখতে পারবেন। রিভিউয়ের সাথে জেলা দেখানো থাকবে।
*Yes. Only customers who placed and received an order can post
a review, with their district shown.*

**অনলাইন পেমেন্ট করা যাবে?**
*Can I pay online?*
এখন শুধু ক্যাশ অন ডেলিভারি। bKash ও Nagad-এর পেমেন্ট শীঘ্রই
আসছে।
*Right now, cash on delivery only. bKash and Nagad payments are
coming.*

**আমার জেলা লিস্টে নেই, কী করব?**
*My thana is not in the dropdown, what do I do?*
চেকআউটে থানা / জেলা সার্চ বক্সে লিখুন। ঢাকার বাইরের সব
জেলায় ডেলিভারি হয়।
*Type it in the thana / district search box at checkout. We
deliver to every district outside Dhaka.*

## 7. Final call to action

> **প্রথম অর্ডারে ১০ % ছাড়। কোড `WELCOME10`।**
> *10 % off your first order. Code `WELCOME10`.*
>
> [কেনাকাটা শুরু করুন](/shop) &nbsp;·&nbsp;
> [WhatsApp-এ অর্ডার](https://wa.me/8801XXXXXXXXX) &nbsp;·&nbsp;
> [ট্র্যাক করুন](/track-order)

Three buttons, in order: shop, WhatsApp order, track. The
WhatsApp deep-link carries the order number, the customer's
name, and the shipping address pre-filled, so the customer
never has to type the order twice.

## Where this lives in the code

- `app/page.tsx` — current home (the e-commerce home). Keep it
  for SEO and returning visitors; add a one-line "About this
  page" link to `/about/landing` for the marketing version.
- `app/about/landing/page.tsx` — the new marketing landing, built
  section by section from this document. A future build swaps
  `app/page.tsx` for the landing once the shop is established.
- `app/about/landing/pricing/page.tsx` — the pricing table,
  imported from `replica/launch/pricing.md` at build time.
- `replica/launch/landing.md` — this file, the source of truth.

## Brand voice check

Read every line back through the voice in `replica/brand.md`:

- **Warm, not cute.** No emoji, no exclamation marks, no
  "Yay!".
- **Honest, not blunt.** The free-delivery threshold is the
  number. The return window is the number. The price is the
  price.
- **Calm, not corporate.** Bengali first, second-person, the
  workshop voice, not a call-centre script.

## Accessibility

Run the launch page through `replica-design`'s contrast check
before the first publish:

```bash
python3 /root/.config/opencode/skills/replica-design/contrast.py \
    replica/design/tokens.json
# expect: 0 failing AA
```

The hero, the pricing table, and the FAQ all use the existing
design tokens (`text`, `text-muted`, `primary`, `surface`,
`border`), so the contrast pass is the same pass the rest of the
site cleared (`replica/parity.md` "By area", 22 pairs, 0 failing
AA).
