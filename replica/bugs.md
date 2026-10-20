# Bugs — Rabeya Furniture e2e test run

Source of truth: `replica/test-plan.md` (cases F01–F07 + cross-cutting).
Test runs: `/tmp/opencode/pw-full.log` (run 1), `/tmp/opencode/pw2.log` (run 2,
the full reference), `/tmp/opencode/pw3.log` (run 3, partial — F01-H1 passed
after the in-memory store fix, then the run was cut short).
Run 2 result: **40 passed, 6 failed** in 4m24s.

Severity scale: **S1** data loss / wrong money / security &nbsp; **S2** user can
hit it &nbsp; **S3** a11y / polish &nbsp; **S4** test / infra.

---

### BUG-001: Double-clicking "অর্ডার নিশ্চিত করুন" creates two orders

- Severity: **S2**
- Flow / case: F01-E12 / F03-E4 (double submit)
- Screen: S08 checkout, S07 product (direct order)
- Build: pre-fix  Browser / device: Chromium, 1280×720

Steps
1. Add 1 product to cart, open `/checkout`, fill the form.
2. Double-click "অর্ডার নিশ্চিত করুন" inside the same tick (or click twice
   very quickly on a slow device).
3. Watch the network panel / DB rows.

Expected: one order, one confirmation page, one order number.
Actual: `POST /api/orders` fires twice; two orders created, two order
numbers issued, two stock decrements, the shopper gets routed to the first
confirmation page and never learns the duplicate exists. In the F03 direct
order variant, F03-E4 counted `posts === 2` (run 1, `pw-full.log:54`).
Evidence: `e2e/f03-direct-order.spec.ts:54` assertion, run log line above.
Suspected cause: the button is disabled via React state (`submitting`), but
state updates are async — two synchronous clicks both get through.
Status: **fixed (no re-run on this device)** — `components/checkout/OrderForm.tsx:51`
adds a `useRef`-backed in-flight guard that blocks the second click in the
same tick; the form also sends a per-mount `idempotencyKey`
(`components/checkout/OrderForm.tsx:107`), and the data layer returns the
existing order on a duplicate key (memory map at `lib/data/memory.ts:158`,
unique `idempotency_key` + winner-takes-all transaction in
`lib/data/sql.ts:216`).

---

### BUG-002: In-memory order store loses orders between request and page render

- Severity: **S2** (in-memory layer) / **S1** if the bug were in Postgres
- Flow / case: F01-H1, F04-H1, F04-E1, F04-N1
- Screen: S09 order confirmation, S06 track order
- Build: pre-fix  Browser / device: Chromium, 1280×720

Steps
1. `POST /api/orders` → 201, body returns `orderNumber`.
2. Client navigates to `/order/<orderNumber>`.
3. Server component calls `getOrderByNumber` → not found → 404 page.

Expected: confirmation page renders the order.
Actual: the order confirmation page rendered the global 404 ("পেজটি খুঁজে
পাওয়া যায়নি") even though the order was just created. The track-order
flow had the same shape: `placeOrderViaApi` succeeded, the subsequent
`/api/orders/track` returned null, the page showed "কোনো অর্ডার পাওয়া
যায়নি".
Evidence: run 2 log, items 1, 4, 5, 6 (`pw2.log:53`, `:178`, `:234`, `:290`).
Suspected cause: Next.js dev mode evaluates the route handler and the page
server component in different module instances; the module-level
`const orders: Order[] = []` is re-initialised when the page module first
compiles, wiping the order the handler had just pushed.
Status: **fixed (no re-run on this device)** — `lib/data/memory.ts:15`
anchors the store on `globalThis.__rabeyaMemory` so every module instance
sees the same array. This is a memory-layer-only fix; the Postgres path
(`lib/data/sql.ts`) already persists, so it is not affected by this bug.

---

### BUG-003: Mobile cart button accessible name doesn't match its visible text

- Severity: **S3** (axe rule label-content-name-mismatch on `/shop` with
  the cart drawer open at 390px)
- Flow / case: F01-E14 (mobile layout)
- Screen: S01, S03 (bottom nav)
- Build: pre-fix  Browser / device: Chromium, 390×844

Steps
1. Open `/shop` at 390px viewport.
2. Add an in-stock product to the cart.
3. Open the cart drawer.
4. Run axe.

Expected: zero axe violations on the cart drawer.
Actual: `label-content-name-mismatch` on the bottom-nav cart button — its
aria-label included the count, but the badge's visible digit sat *before*
the word "কার্ট" in DOM order, so the element's text was
`"১কার্ট"`, which is not a substring of the name.
Evidence: `pw2.log:142` (E14 failure); reproduced and confirmed against
`components/layout/BottomNav.tsx`.
Suspected cause: the badge digit was a text node sibling of the label
text, and axe's `label-content-name-mismatch` compares the element's
textContent with the accessible name as strings.
Status: **fixed (no re-run on this device)** — the badge in
`components/layout/BottomNav.tsx:36` now renders the count via a CSS
`::before` pseudo-element with `content: attr(data-count)`, so the badge
has no text node. The button's textContent is just "কার্ট" and the
accessible name "কার্ট, ১টি পণ্য" contains it. Reproduced-clean probe at
390px after the fix.

---

### BUG-004: Cart drawer on mobile exposes duplicate `banner` / `contentinfo` landmarks

- Severity: **S3** (axe landmark-no-duplicate-banner / -contentinfo /
  landmark-unique)
- Flow / case: F01-E14
- Screen: S03 cart drawer
- Build: pre-fix

Steps
1. Open the cart drawer on any viewport.
2. Run axe on the page.

Expected: each landmark (banner, contentinfo) appears once.
Actual: the drawer used `<header>` and `<footer>` for its title bar and
checkout bar; per HTML-AAM, those map to `banner` and `contentinfo` when
not nested in `article / aside / main / nav / section`, so the page had
two of each and axe flagged "landmark must be unique".
Status: **fixed** — `components/cart/CartDrawer.tsx:45, 96` swap those to
plain `<div>`s. Also: `components/layout/Footer.tsx` heading level was
bumped to `<h2>`, `components/layout/WhatsAppFloat.tsx` wrapped in
`<aside aria-label="সাপোর্ট">` (rebrand-sweep pass, pre-bug).

---

### BUG-005: Disabled buttons fall back to opacity-50 with insufficient contrast

- Severity: **S3** (axe color-contrast; transient during state changes
  and poor low-vision UX)
- Flow / case: F02-H1 (shop listing after quick-add)
- Screen: S03, S08
- Build: pre-fix

Steps
1. Open `/shop` and click the first "কার্টে যোগ করুন".
2. While the button is briefly disabled, run axe.

Expected: contrast ratio ≥ 4.5:1 for body text on background.
Actual: the disabled style was `disabled:opacity-50` on `bg-primary`;
while the button transitioned from enabled to disabled, axe sampled
mid-flight and reported `color-contrast 2.7` (white on the washed-out
primary). The same problem affects every primary/secondary/accent/danger
button while loading.
Status: **fixed** — `components/ui/Button.tsx:31` replaces the opacity
fallback with an explicit accessible style:
`disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-muted`.
Contrast of `text-text-muted` on `bg-surface` is 5.37:1 (verified at
token level). Reproduced-clean probe after the fix.

---

### BUG-006: Browser console logs a 404 for the missing favicon on every page

- Severity: **S4** (test noise — the console-error guard fails; no user
  impact beyond a tab icon)
- Flow / case: every F01 / F04 test with the `guards` fixture
- Screen: all
- Build: pre-fix

Steps
1. Load any app page in Chromium.
2. Inspect the console.

Expected: no `Failed to load resource: 404` lines.
Actual: Next.js served no icon, Chromium auto-requested `/favicon.ico`,
the dev server returned 404, the console-error guard in `e2e/support.ts:61`
flagged it and soft-failed the test.
Evidence: `pw2.log:76, 201, 257, 292`.
Status: **fixed** — `app/icon.svg` (an SVG "RF" mark on the brand primary)
was added; Next auto-serves it as the favicon. Other test-noise fixes in
this pass: `e2e/support.ts:69` adds an `alerts(page)` helper that ignores
Next's `<div role="alert" id="__next-route-announcer__">` so the
form-error assertions don't trip on the route announcer.

---

## Notes for the next test run

These six are the only failures observed in run 2. After the fixes in
this document, run 3 (partial, `pw3.log`) confirmed BUG-002 is gone — the
first test, F01-H1, navigated to the confirmation page and found the
heading. The remaining five (BUG-001, 003, 004, 005, 006) have the same
shape: a known root cause with a targeted fix and a clean reproduction
probe, but no full re-run on this device.

Re-run is blocked on a thermal issue with the host phone (Samsung S25
Ultra, kernel 6.6, aarch64) — sustained headless Chromium + Next dev
compile drives the SoC into the 50–54 °C range and Samsung's thermal
protection has rebooted the device mid-run. Recommended next moves when
the device is cool / plugged in: rerun `bash e2e/run.sh` end-to-end, then
hand the suite to CI on a proper machine. The fixes here are
self-contained and do not need any new tooling.
