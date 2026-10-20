# Brand — Rabeya Furniture

The rebrand that turns the Sicily clone into your own product. Source of
truth for everything the customer sees: `replica/brand.json`. The rebrand
sweep (`sweep.py`) is clean as of this writing.

## 1. Name

**Chosen: Rabeya Furniture (রাবেয়া ফার্নিচার).**
Tagline: "হাতে তৈরি হোম ডেকোর, মনে রাখার মতো" — "Handmade home decor worth remembering".

The name is the founder's first name plus the category in plain English.
Bengali-first because the product, the customer and the workshop are all
Bengali. The word "Furniture" is the bilingual convention on a Bengali
e-commerce URL — it makes the brand name searchable for a customer who
hears it and types it in English letters, and it parks the result in the
right Google category.

The name is not a pun on "Sicily", not a rhyme, and not a tweak of any
app in the home-decor space we could find. Sicily's original name lives
in `_original_reference_only` inside `replica/design/tokens.json` so
nothing in the clone quietly re-uses it.

### Alternatives considered and rejected

| candidate | why not |
| --- | --- |
| Sicily Garden | echoes the original, still "Sicily"; trademark exposure |
| Ghori (ঘরী) | means "of the home" — too generic to be a brand, easy to confuse with a dozen existing shops |
| Bonsai & Bloom | pushes the product line; the store sells orchid tubs, frames and shelves too, not just plants |
| Moss & Stone (মস ও পাথর) | metaphor, but in Bangla it reads as a tile/construction shop |

The founder's name wins because it is owned, it is unambiguous, and a
returning customer can type the first four letters in the search bar
and land on the right shop.

## 2. Screening checks — to run

These are screening checks, not legal clearance. Before spending money
on the name, a trademark lawyer should run a proper search. Today:

| check | where | result |
| --- | --- | --- |
| US trademark | https://tmsearch.uspto.gov (classes 9, 20, 42) | **to run** |
| EU trademark | https://euipo.europa.eu/eSearch | **to run** |
| Bangladesh trademark | https://www.dpdt.gov.bd | **to run** — most relevant |
| Domain | whois rabeyafurniture.bd, .com | **to run** (.bd via a local registrar) |
| App Store | search "Rabeya Furniture" | **to run** |
| Google Play | search "Rabeya Furniture" | **to run** |
| Handles | X, Instagram, TikTok, Facebook | **to run** — reserve the exact name on all four before launch |
| Web | "Rabeya Furniture" Bangladesh | ran informally; no dominant incumbent in the home-decor niche |

If the .bd domain is taken, fall back to `rabeyadecor.bd` (mirrors the
tagline) — same screening.

## 3. Palette

The original's palette was teal (`#0b5d5c`) + hot pink (`#e6027c`) +
warm gold (`#c6a15b`) on a cream surface. The new palette deliberately
moves to a different family: **charcoal stone, moss, and cream**. It
sits next to the original on a shelf and the two are not confusable.

| role | new | original (do not use) |
| --- | --- | --- |
| primary | `#3a3a40` charcoal stone | `#0b5d5c` teal |
| secondary | `#52525b` slate | `#e6027c` pink |
| accent | `#5f5f6a` pewter | `#c6a15b` gold |
| text | `#16161a` near-black | `#16130f` |
| text-muted | `#5b5b66` | `#6b6560` |
| bg | `#ffffff` | `#ffffff` |
| surface | `#f6f6f4` | `#faf7f1` |
| border | `#e3e2dd` | `#e9e3d8` |
| danger | `#a52626` | — |
| success | `#1a6a43` | — |
| warning | `#92400e` | — |
| whatsapp | `#25d366` | `#25d366` (universal, kept) |

Full token file: `replica/design/tokens.json`. Contrast check:

```bash
python3 /root/.config/opencode/skills/replica-design/contrast.py \
    replica/design/tokens.json
# 22 pairs, 0 failing AA
```

The check uses the new roles (primary on bg = 11.30:1 AAA, danger on
bg = 7.23:1 AAA, text-muted on bg = 6.70:1 AA, accent on bg = 6.30:1
AA), so the entire UI clears WCAG AA at body sizes and AAA at
headlines. The original colours are still recorded under
`_original_reference_only` so `sweep.py` can detect any that survive.

## 4. Logo brief

A monogram, not a wordmark — the shop sells across Facebook, WhatsApp
and Instagram, where the favicon and the avatar live at 32 px.

- **Idea in one line**: "RF" set in a charcoal-stone rounded square —
  the same stone the products are made of.
- **Mark type**: monogram ("RF"), Inter Bold at 16/20 ratio, white on
  `#3a3a40`. Single colour, no gradient, no shadow.
- **Must work at 16 px** (favicon) **and 1024 px** (App Store icon).
  The "RF" stays legible at 16 px because both glyphs have a wide x-height.
- **Deliverables**:
  - `app/icon.svg` (already in place, 32×32 viewBox)
  - App icon 1024×1024, no transparency, no rounded corners baked in
  - Favicon set (16, 32, 180, 512)
  - Social image 1200×630 with the mark on the left, the tagline on
    the right
- **Must not resemble the original's mark**: the original is a serif
  wordmark in a frame. The clone's mark is a sans monogram in a
  rounded square. Different shape, different letterforms, different
  weight. Put them side by side before approving the first export.

## 5. Voice

**Three words**: warm, honest, calm.

- **Warm**, not cute. "আপনার অর্ডার গেলো পথে" not "Yay! 🎉".
- **Honest**, not blunt. Say the delivery charge is ৳80, not "ডেলিভারি
  চার্জ প্রযোজ্য হতে পারে".
- **Calm**, not corporate. No ALL CAPS, no exclamation marks in body
  copy, no exclamation marks in transactional emails.

**Five do-and-don't pairs**:

1. **Do** write the price next to the product name.
   **Don't** hide the price behind a "View" button.
2. **Do** say the delivery day as a range ("২-৩ দিন").
   **Don't** promise a single day when the courier does not commit.
3. **Do** ask for the customer's name once and remember it.
   **Don't** greet them as "Dear Customer" in every email.
4. **Do** write error messages that tell the shopper what to fix.
   **Don't** show a code ("ERR_VALIDATION_422").
5. **Do** keep the WhatsApp template short and to the point.
   **Don't** pad it with a paragraph of brand story every time.

**Ten most-seen strings, rewritten in this voice**
(in `app/`, `components/`, `lib/email.ts`):

| surface | string | new (Bengali-first) |
| --- | --- | --- |
| home H1 | "রাবেয়া ফার্নিচার" | "রাবেয়া ফার্নিচার" (kept) |
| home sub | "হাতে তৈরি হোম ডেকোর" | "হাতে তৈরি হোম ডেকোর, মনে রাখার মতো" |
| shop empty | "এই ক্যাটাগরিতে এখনো কিছু নেই" | "এই ক্যাটাগরিতে এখনো কিছু নেই — শীঘ্রই আসছে" |
| cart empty title | "আপনার কার্টে কোনো পণ্য নেই" | kept |
| cart empty hint | "অর্ডার করতে হলে প্রথমে শপ পেজ থেকে কার্টে পণ্য যোগ করুন" | kept |
| checkout heading | "চেকআউট ও বিলিং" | "অর্ডারের তথ্য" |
| confirmation heading | "অর্ডার সফল হয়েছে!" | "অর্ডার গেলো। ধন্যবাদ।" |
| toast added | "কার্টে যোগ হয়েছে" | kept |
| track empty | "কোনো অর্ডার পাওয়া যায়নি" | "এই নম্বরে কোনো অর্ডার নেই" |
| error fallback | "অর্ডার সম্পন্ন হয়নি" | "অর্ডার নেওয়া যায়নি — আবার চেষ্টা করুন" |

The first and last are the ones a returning customer notices first.
The "অর্ডার গেলো" line replaces a market-standard exclamation with
a confirmation that does not shout.

## 6. The sweep

```bash
python3 /root/.config/opencode/skills/replica-brand/sweep.py . \
    --config replica/brand.json
# Clean. Nothing of the original's name, domain or colours found.
```

This includes file contents and file names. Skipped: `node_modules`,
`.next`, lock files, binary assets, and the `replica/` planning folder
(the original's name belongs there, in the recon map). The sweep also
checked the email template (`lib/email.ts`) and the favicon
(`app/icon.svg`) — both were using two of the original's colours and
have been swapped to the new palette.

By-eye checks (run these before launch):
- Browser tab title on every page is "রাবেয়া ফার্নিচার" (or
  "<page> | রাবেয়া ফার্নিচার").
- The favicon shows the "RF" monogram on charcoal, not the old teal.
- The OG image and the App Store / Play icon match the brief above.
- The transactional email (new order alert + customer receipt) renders
  the new palette end to end.
- The 404 page and the offline state use the new palette.

Next: `/replica-launch` for the landing page, pricing, and the store
listings.
