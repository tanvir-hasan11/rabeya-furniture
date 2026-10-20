# Components — Rabeya Furniture

Design system spec, rebuilt clean-room from the recon. Roles and behaviour are
shared patterns; **icons, fonts, copy and colour are not taken from the
original.**

- **Palette:** neutral placeholders in `tokens.json`. The original's palette is
  recorded under `_original_reference_only` for the rebrand sweep only — never
  ship it. `replica-brand` supplies the real palette.
- **Fonts (open):** *Hind Siliguri* (Bengali, SIL OFL) + *Inter* (Latin, SIL
  OFL). Both are open, so nothing is licensed.
- **Icons (open):** Lucide (ISC). Never the original's icons or illustrations.
- **Copy:** every label, empty state and error below is written fresh.
- **Base UI:** build on Radix primitives (or shadcn/ui) for accordion, dialog,
  select, radio — accessibility comes free.
- **Where to build:** in isolation on a `/design` route before any screen
  (Step 4). That page is the design-system check.

Tokens referenced by name map to `tokens.css` / the Tailwind theme
(`bg-surface`, `text-muted`, `border-border-input`, …). Use names, never hex.

---

## Button
- variants  `primary` (bg primary / on-primary), `secondary` (bg secondary),
  `accent`, `ghost` (transparent, text primary, border on hover), `danger`,
  `whatsapp` (bg whatsapp / on-whatsapp)
- sizes     `sm` 32px, `md` 40px, `lg` 48px, `icon` 40px square
- states    default, hover (slightly darker), active (pressed), focus-visible
  (2px accent ring, offset 2), disabled (opacity 50, no pointer), loading
  (spinner + keeps label for screen readers via `aria-busy`)
- tokens    radius md, font sm/600, gap-2
- a11y      real `<button>`; `type="button"` unless submitting; icon-only needs
  `aria-label`; loading sets `aria-busy="true"` and disables
- used on   S01–S05, all forms

## Input / Textarea / Select
- variants  text, tel, number, textarea, native select (district)
- sizes     md 44px (touch target ≥44), lg 48px
- states    default (border-border-input), hover, focus (accent ring), filled,
  disabled, error (border danger + message), success
- tokens    bg bg, radius sm, font base, padding px-3 py-2
- a11y      `<label>` always visible above the field; error tied with
  `aria-describedby`; `inputmode="numeric"` on phone; district select keeps a
  native menu for mobile
- used on   S03 order form, S05 checkout, S07 track

## RadioGroup (payment method)
- options   Cash on Delivery (default), Online (disabled, "শীঘ্রই")
- tokens    selected ring accent, label base
- a11y      Radix RadioGroup, arrow-key navigable, disabled locked with a reason
- used on   S03, S05

## Product card
- variants  `grid` (default), `compact` (carousel/row)
- parts     image (aspect-square, bg surface), discount badge (top-left,
  gradient, white, xs), wishlist heart (top-right, circular, bg white/95),
  name (base/600, clamp 2), price block, stock badge, add-to-cart
- states    in-stock, low-stock, out-of-stock (image dimmed, button disabled),
  discounted, hover (border accent/40, lift, shadow card)
- a11y      whole card is one link; the add-to-cart is a separate button and
  does not navigate; heart is `aria-pressed`
- used on   S01, S02, S03 related, S08

## Price block
- variants  `sale` (current + compare-at struck + "-N%" pill), `plain`
- tokens    current text/600, compare text-muted line-through, pill danger/on-danger
- used on   cards, S03, S04, S05, S06

## Stock badge
- values    in_stock "স্টকে আছে" (success), low_stock "Nটি বাকি" (warning),
  out_of_stock "স্টক শেষ" (muted)
- tokens    xs/600, radius pill
- used on   cards, S03

## Quantity stepper
- states    min (minus disabled), max (plus disabled at stock), disabled
- a11y      buttons labelled "পরিমাণ বাড়ান"/"কমান"; value in an
  `aria-live="polite"` region
- used on   S03, S04

## Rating stars + review card
- stars     display only, 5 stars, partial fill, `aria-label="৫-এর মধ্যে N"`,
  size sm/md
- review    avatar initial, name + city, "ভেরিফাইড ক্রেতা" badge (success),
  stars, body, date
- used on   S03

## Image gallery
- variants  main + thumbnail strip (S03), swipeable on mobile
- a11y      alt text in Bengali per image; arrows are buttons with labels
- used on   S03

## Benefit / box-contents list
- variants  `benefit` (icon + label), `box` (bold title + muted subtitle)
- tokens    icon in bg surface circle, border border
- used on   S03

## FAQ accordion
- states    closed, open, hover
- a11y      Radix Accordion, `aria-expanded`, keyboard Enter/Space, single-open
- used on   S03, S12

## Order form (inline S03 + checkout S05)
- fields    name, phone, district select, address, payment radio, coupon
  (collapsible), note
- states    idle, validating, error per field, submitting (button loading),
  success → confirmation
- behaviour district selection sets the shipping fee live; coupon "প্রয়োগ"
  shows discount or an inline reason; total updates in the summary
- a11y      fields labelled, phone validated inline, errors announced
- used on   S03, S05

## Order summary
- parts     subtotal, shipping, discount (if any), total (large), free-delivery
  hint when below threshold
- tokens    total text/lg, rows text-muted sm
- used on   S03, S04, S05, S06

## Toast / inline notice
- variants  success (added to cart), error, info
- behaviour auto-dismiss ~3s, dismissible, stacks top or bottom above bottom-nav
- a11y      `role="status"` (polite); errors `role="alert"`
- used on   S01–S05

## Empty state
- variants  cart, wishlist, checkout, track-not-found, search-no-results
- parts     icon (Lucide, muted), one-line heading, one-line hint, CTA
- used on   S04, S05, S07, S08

## Modal / Drawer (cart)
- behaviour cart is a bottom-sheet on mobile, right drawer on desktop
  (`/cart` is not a route in the original; keep it a slide-over)
- a11y      focus trap, Esc closes, `aria-modal`, restore focus on close,
  scroll lock
- used on   S04

## Header
- parts     logo (own wordmark), wishlist icon (count), cart shortcut on desktop
- behaviour sticky (`top-0 z-40`), translucent white + blur, bottom border
- a11y      skip-to-content link, nav landmark
- used on   all

## Bottom nav (mobile)
- tabs      হোম, শপ, কার্ট (badge), লাইভ চ্যাট, প্রোফাইল (icons + label)
- tokens    64px tall, bg bg, top border, active = accent
- a11y      `<nav aria-label="প্রধান">`, current tab `aria-current="page"`,
  targets ≥44px
- used on   all (mobile)

## Announcement / promo strip
- variants  offer, free-delivery, limited-time; dismissible
- used on   S01, S03

## Hero carousel
- behaviour autoplay, pause on hover/focus, dots, swipe
- a11y      arrow buttons labelled, `aria-roledescription="carousel"`, respects
  `prefers-reduced-motion`
- used on   S01

## Countdown timer
- parts     hh / mm / ss blocks, "ফ্ল্যাশ ডিলস" label
- behaviour counts down to `flash_ends_at` (UTC → Asia/Dhaka), hides at zero
- a11y      `aria-live="off"` on ticking digits, label outside the live region
- used on   S01

## Category tile
- states    active/inactive; "সব দেখুন" is the active default
- used on   S01, S02

## WhatsApp CTA / float
- variants  inline button (S10/S13), floating action (all, bottom-right above
  bottom-nav)
- tokens    bg whatsapp / on-whatsapp; label "হোয়াটসঅ্যাপে চ্যাট করুন"
- a11y      when WhatsApp is absent, falls back to `tel:`; icon has a label
- used on   S10, S13, all pages

## Footer
- parts     4 columns (brand line, categories, info links, contact + socials),
  SSLCommerz-style payment strip placeholder, copyright
- a11y      `<footer>` landmark, link lists as `<nav>`
- used on   all

## Breadcrumb / back link
- parts     back-to-shop link ("শপে ফিরে যান") on S03; breadcrumb on S02
- used on   S02, S03

## Skeleton
- variants  card, text line, gallery
- behaviour shown while listing/detail data loads; respects reduced motion
- used on   S01, S02, S03

---

## Contrast

`python3 contrast.py replica/design/tokens.json` → **17 pairs, 0 failing AA.**
AA is the floor (4.5 body, 3 large / UI). Re-run after `replica-brand` swaps the
palette, because a new palette is where contrast breaks.

## Primitives to build first (Step 4)

`Button, Input, Select, RadioGroup, Badge, Toast, Accordion, Dialog/Drawer,
Skeleton, ProductCard, PriceBlock, StockBadge, QuantityStepper, RatingStars,
EmptyState` — on a `/design` route, then screenshot it. Screens only start in
`/replica-build`.
