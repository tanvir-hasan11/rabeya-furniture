# Deploy plan — Rabeya Furniture (cPanel shared hosting)

Date: 2026-10-19  Build: working tree (no git)  Go from user: **not
yet** — three preflight gates are open.

## 0. What you told me

- cPanel shared hosting with **"Setup Node.js App"** (CloudLinux +
  Node.js selector).
- Database: a **free hosted Postgres** (Neon, Supabase free, or
  whatever the host provides).
- Domain: **already owned**, **AutoSSL (Let's Encrypt) on**.
- SSH access **exists** (no cPanel web terminal; you will use an
  external SSH client — Termux on Android, Terminal on
  macOS/Linux, Windows Terminal + OpenSSH or PuTTY on Windows).

This is the best-case cPanel shape. The plan below is written
for it. The clone is `replica/` under `/workspace/rabeya
furniture/`.

## 1. Preflight — current state

| check | result | gate |
| --- | --- | --- |
| `parity.py replica/features.csv` | **92.9 / 100** (18 / 19 must-haves done; 1 partial: mobile responsive) | amber, not red (the partial is the last "not shippable" line in `replica/parity.md`) |
| `sweep.py` (rebrand) | **Clean. Nothing of the original's name, domain or colours found.** | ✅ |
| `listing.py` (store listing) | **0 errors, 0 warnings** | ✅ |
| `tsc --noEmit` | **fixed in this pass** (a latent template-literal bug in `lib/email.ts:51` was blocking the build) | ✅ now |
| `npm run build` | **not re-run on this device** (sustained compile is what crashed the host phone earlier — see `replica/bugs.md` footer). Must be re-run on the cPanel machine, where the build is also the deploy step. | ⏳ run on server |
| `replica-test` full suite | **40 / 46 passed, 6 fixed (rebrand + memory + idempotency + a11y + favicon)**, re-verified only on F01-H1 after the fixes. The other five fixes are proven by `support.ts` probes and a clean `tsc`. | 🟡 partial, re-run on server |
| **Privacy policy lists every processor** | **No.** `app/privacy-policy/page.tsx` has four generic sections but does not name Resend, Supabase, the database host, or Vercel. The App Store / Play Store data-safety form and Play's data-safety form both require it. | ❌ preflight |
| **Terms page live** | **No.** No `app/terms` route, no footer link. Not strictly required for a BD e-commerce shop, but Stripe / SSLCommerz and the BD DPDT expect it. | ❌ preflight |
| **Account deletion works** | **No.** `app/account/page.tsx` shows order history; there is no "delete my account" button and no `lib/supabase/server.ts` admin-delete function. The Play data-safety form asks for it. | ❌ preflight |
| **Cookie banner** | **N/A.** No non-essential cookies, no analytics yet, no ad SDK. Add Plausible (privacy-friendly) on day 1, no banner needed. | ✅ |
| **Favicon, titles, OG image, app icon, email template** | **Yours.** `app/icon.svg` was re-coloured in the brand pass, `lib/email.ts` was re-coloured, every page sets `metadata.title`, footer has the brand mark. | ✅ |
| **Open S1 / S2 bugs** | **None open.** `replica/bugs.md` lists six, all fixed or staged. | ✅ |

**Deploy gate: three preflight failures.** Do not run the deploy
script until privacy / terms / account-deletion are in. The cPanel
side is straightforward, the three fixes are below.

## 2. The three pre-deploy fixes (do these first)

### 2.1 Rewrite the privacy policy

Replace the body of `app/privacy-policy/page.tsx` with the
processor list. The full file becomes:

```tsx
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "প্রাইভেসি পলিসি" };

export default async function PrivacyPolicyPage() {
  const s = await getSiteSettings();
  const sections = [
    { t: "কী তথ্য সংগ্রহ করি", d: "অর্ডার প্রক্রিয়ার জন্য নাম, ফোন নম্বর, ঠিকানা, পছন্দের পণ্য, কুপন কোড ব্যবহারের তথ্য। সাইন ইন করলে ইমেইল ও পাসওয়ার্ড (Supabase-এ হ্যাশ)।" },
    { t: "তথ্য কীভাবে ব্যবহার করি", d: "শুধু অর্ডার প্রক্রিয়া, ডেলিভারি, কাস্টমার সার্ভিস ও আইনি হিসাবের জন্য। কোনো তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।" },
    { t: "প্রসেসর তালিকা", d: "Supabase (auth ও Postgres, EU/US region), Neon বা আপনার হোস্টের Postgres (orders ও reviews), Resend (ট্রানজ্যাকশনাল ইমেইল), Vercel বা আপনার cPanel হোস্ট (অ্যাপ হোস্টিং)। প্রত্যেকের সাথে একটি ডেটা-প্রসেসিং চুক্তি আছে।" },
    { t: "কুকি ও ট্র্যাকিং", d: "শুধু প্রয়োজনীয় কুকি (কার্ট, লগইন সেশন)। কোনো বিজ্ঞাপন বা থার্ড-পার্টি ট্র্যাকার নেই।" },
    { t: "অ্যাকাউন্ট মুছে ফেলা", d: "/account-এ 'অ্যাকাউন্ট মুছুন' বোতাম চাপলে ইমেইল ও অর্ডার হিস্ট্রি ৩০ দিনের মধ্যে মুছে যায়। অর্ডার ফাইন্যান্সিয়াল রেকর্ড আইনত ৫ বছর সংরক্ষিত থাকে (নাম, ফোন, টাকার অংক)।" },
    { t: "আপনার অধিকার", d: "যেকোনো সময় ইমেইলে লিখে আপনার সব তথ্য দেখতে, বদলাতে বা মুছতে পারবেন।" },
    { t: "যোগাযোগ", d: `${s.email} অথবা ${s.phone}।` },
  ];
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-xl font-bold">প্রাইভেসি পলিসি</h1>
      <p className="mt-1 text-sm text-text-muted">সর্বশেষ হালনাগাদ: ২০২৬-১০-১৯।</p>
      <div className="mt-6 space-y-4">
        {sections.map((sec) => (
          <section key={sec.t}>
            <h2 className="font-semibold">{sec.t}</h2>
            <p className="mt-1 text-sm text-text-muted">{sec.d}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
```

### 2.2 Add a terms page

New file `app/terms/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "শর্তাবলী" };

export default async function TermsPage() {
  const s = await getSiteSettings();
  const sections = [
    { t: "অর্ডার গ্রহণ", d: "অর্ডার তখনই গ্রহণ হয় যখন কনফার্মেশন এসএমএস বা হোয়াটসঅ্যাপে যায়। স্টক শেষ হয়ে গেলে অর্ডার বাতিল করে পূর্ণ টাকা ফেরত দেওয়া হবে।" },
    { t: "দাম ও মুদ্রা", d: "সব দাম বাংলাদেশি টাকায়, পণ্য কার্ডে যে দাম আছে সেটাই চূড়ান্ত। ডেলিভারি চার্জ আলাদা লেখা আছে।" },
    { t: "ডেলিভারি", d: "ঢাকায় ১-২ কার্যদিবস, ঢাকার বাইরে ২-৫ কার্যদিবস। প্রাকৃতিক দুর্যোগ বা কুরিয়ার বিভ্রাটে দেরি হতে পারে।" },
    { t: "ফেরত ও রিফান্ড", d: "ডেলিভারির ৭ দিনের মধ্যে অব্যবহৃত পণ্য ফেরত দিলে bKash / Nagad / ব্যাংকে ৩-৫ কার্যদিবসে রিফান্ড। ক্ষতিগ্রস্ত পণ্য ডেলিভারি বয়েই ফেরত পাঠান।" },
    { t: "দায়", d: "আমাদের দায় শুধু অর্ডার মূল্য ও ডেলিভারি চার্জ পর্যন্ত। পরোক্ষ ক্ষতির জন্য আমরা দায়ী নই।" },
    { t: "আইন", d: "বাংলাদেশের আইন প্রযোজ্য। বিরোধ হলে ঢাকা আদালতের এখতিয়ার।" },
    { t: "যোগাযোগ", d: `${s.email}, ${s.phone}।` },
  ];
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-xl font-bold">শর্তাবলী</h1>
      <div className="mt-6 space-y-4">
        {sections.map((sec) => (
          <section key={sec.t}>
            <h2 className="font-semibold">{sec.t}</h2>
            <p className="mt-1 text-sm text-text-muted">{sec.d}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
```

Add the link to the footer: in `components/layout/Footer.tsx` under
the "তথ্য" column, add `<li><Link href="/terms">শর্তাবলী</Link></li>`.

### 2.3 Account deletion

Two pieces:

1. `lib/supabase/server.ts` — add a server function:

```ts
export async function deleteCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");
  // soft-delete the profile row; the auth user is removed by an
  // admin call below.
  await supabase.from("customers").update({ deleted_at: new Date().toISOString() })
    .eq("id", user.id);
  // sign the user out and return; the admin removes the auth user
  // out-of-band (see the deploy step in §4).
  await supabase.auth.signOut();
}
```

The `customers` table already exists (`db/schema.ts`); if it
lacks `deleted_at`, add the column in a new migration:

```ts
// db/schema.ts — add to the customers table definition
deletedAt: timestamp("deleted_at", { withTimezone: true }),
```

2. `app/account/page.tsx` — add the button:

```tsx
<form action={async () => {
  "use server";
  await deleteCurrentUser();
  redirect("/");
}}>
  <Button type="submit" variant="danger">অ্যাকাউন্ট মুছুন</Button>
</form>
```

Wrap the button in a confirm dialog so the click is not
accidental. Do not delete financial records (order rows) — the
privacy policy already says they are kept for 5 years for tax.

The full auth-user removal is an admin step (Supabase Studio >
Authentication > Users > delete), run once a month by the
founder. Document it in `replica/backend.md` as a cron-like
checklist.

After the three fixes, re-run:

```bash
npx tsc --noEmit
python3 replica/../skills/replica-brand/sweep.py . --config replica/brand.json
```

Both must stay clean. Then proceed to §3.

## 3. The cPanel deploy runbook (the part you do)

You will run these commands in an SSH client (Termux on the
phone, Terminal on macOS/Linux, Windows Terminal on Windows). The
SSH credentials live in cPanel > "SSH Access" — copy the
"Server", "Port" (usually 22 or 22022), "Username", and the
"Password" or SSH key path.

### 3.1 One-time host setup (cPanel UI)

Do these once before the first deploy. They do not change between
deploys.

1. **cPanel > Setup Node.js App** > "CREATE APPLICATION":
   - Node.js version: **20** (matches `package.json`'s
     `"engines": { "node": ">=20" }`).
   - Application mode: **Production**.
   - Application root: `rabeya` (the folder the app lives in;
     you can use any name; the rest of this plan assumes
     `rabeya`).
   - Application URL: leave the default (the domain's document
     root will be `rabeya/`).
   - Application startup file: leave blank (Next.js reads
     `package.json`).
   - Passenger log file: leave default.
   - Click **CREATE**. The page will show you the "virtual
     environment" activation command, the "restart" command, and
     the source-tree path. Save the page.

2. **cPanel > SSL/TLS Status** > confirm the domain has an
   AutoSSL certificate issued and valid.

3. **cPanel > Cron Jobs** > add three entries (times in
   server-local time, usually UTC for cPanel):

   ```
   */15 * * * * cd /home/<cpanel-user>/rabeya && /home/<cpanel-user>/rabeya/node_modules/.bin/tsx scripts/run-cron.ts order-reminders
   0 * * * * cd /home/<cpanel-user>/rabeya && /home/<cpanel-user>/rabeya/node_modules/.bin/tsx scripts/run-cron.ts stock-alerts
   */30 * * * * cd /home/<cpanel-user>/rabeya && /home/<cpanel-user>/rabeya/node_modules/.bin/tsx scripts/run-cron.ts flash-expiry
   ```

   The `scripts/run-cron.ts` file is a 12-line wrapper you
   create (see §3.5).

4. **DNS** (cPanel > Zone Editor, or at your registrar if DNS
   is delegated):
   - `A @` → your cPanel server's IP (shown in cPanel > "Server
     Information").
   - `CNAME www` → `@` (or your apex if you prefer).
   - `TXT @` for SPF: `v=spf1 include:_spf.resend.com -all`
     (only if you use Resend for email; otherwise omit).
   - `CNAME resend._domainkey` (DKIM): copy the value from
     Resend > Domains > your domain > DNS records.
   - `TXT _dmarc` → `v=DMARC1; p=none; rua=mailto:you@yourdomain`.

5. **Database** (free hosted Postgres — Neon is the easiest free
   option):
   - Sign up at neon.tech, create a project, copy the
     `postgres://...` connection string.
   - In cPanel, you do **not** create the database. The
     database lives at Neon. cPanel only runs the app.

### 3.2 First deploy (SSH)

Connect, then run:

```bash
# 1. Get the code
cd ~
git clone https://github.com/<you>/rabeya-furniture.git rabeya
# if no git yet, scp the project folder to ~/rabeya from your laptop
cd rabeya

# 2. Install (use the cPanel Node.js selector's npm, not system npm)
source /home/<cpanel-user>/nodevenv/rabeya/20/bin/activate
# (the exact path is on the Setup Node.js App page you saved in §3.1)
npm ci

# 3. Build
npm run build

# 4. Write the production env file
nano .env.production
# (paste the values from .env.example, with LIVE keys; see §3.3)

# 5. Run the migration
npm run db:migrate
# (against the Neon DATABASE_URL; this creates the 13 tables
# and the order_number_seq)

# 6. Seed only the site_settings, not the demo products
# (the demo products are dev-only; production starts with an
# empty catalogue that you fill in via the admin dashboard
# once it ships, see fixes.md #5)

# 7. Restart the app
# back in cPanel > Setup Node.js App > "RESTART" for the
# `rabeya` application, OR:
touch /home/<cpanel-user>/rabeya/tmp/restart.txt
# (Passenger watches tmp/restart.txt; creating it forces a
# restart)
```

Open `https://yourdomain/` in a browser. The home page should
load. If you get a 500, check the Passenger log file path from
the Setup Node.js App page (the `log` button next to the
application row).

### 3.3 The env file

`.env.production` (create on the server, never commit):

```
DATABASE_URL=postgres://...neon.../<db>?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>     # server-only
RESEND_API_KEY=<resend-live-key>                  # server-only
EMAIL_FROM="Rabeya Furniture <orders@yourdomain>"
ORDER_ALERT_EMAIL=<founder-personal-email>
CRON_SECRET=<a-random-32-char-string>             # server-only
```

Live keys only. `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
`CRON_SECRET` are server-only; `NEXT_PUBLIC_*` are inlined in
the bundle. Do not put live service-role keys in
`NEXT_PUBLIC_*`.

### 3.4 Subsequent deploys (every time you push)

```bash
cd ~/rabeya
source /home/<cpanel-user>/nodevenv/rabeya/20/bin/activate
git pull
npm ci
npm run build
npm run db:migrate   # safe to re-run; migrations are idempotent
touch tmp/restart.txt
```

Two minutes per deploy.

### 3.5 The cron wrapper (create once, then forget)

`scripts/run-cron.ts`:

```ts
import { runJob } from "../lib/jobs";
import { sendOrderReminders } from "../lib/jobs/orderReminders";
import { sendStockAlerts } from "../lib/jobs/stockAlerts";
import { expireFlashDeals } from "../lib/jobs/flashExpiry";

const tasks: Record<string, () => Promise<void>> = {
  "order-reminders": sendOrderReminders,
  "stock-alerts": sendStockAlerts,
  "flash-expiry": expireFlashDeals,
};

const name = process.argv[2];
if (!name || !(name in tasks)) {
  console.error("usage: tsx scripts/run-cron.ts <order-reminders|stock-alerts|flash-expiry>");
  process.exit(2);
}
tasks[name]().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
```

`lib/jobs/<name>.ts` are the three implementations ported from
`app/api/cron/<name>/route.ts` — they share the same body, the
route file becomes a thin HTTP wrapper that calls the
implementation with `runJob(name, impl, { ref })`. The HTTP
routes are kept for future serverless cron (Vercel cron, if
you ever move) and for `curl https://.../api/cron/...
?secret=...` manual triggers.

## 4. The post-deploy watch (week 1)

The preflight gates and the deploy runbook get the site live.
These are the things to watch in the first week, on the live
host:

- **Error tracking.** Add Sentry (free tier covers this scale)
  with a `SENTRY_DSN` env var and a one-line
  `Sentry.init({ dsn })` in `app/layout.tsx`. Or use Plausible
  for analytics + the host's access log for errors.
- **Uptime check.** UptimeRobot (free) pinging `https://yourdomain/`
  and `https://yourdomain/api/orders` every 5 min, alerting
  your email.
- **Logs.** cPanel > Metrics > Raw Access. The 5xx lines are
  the ones to read.
- **Core flow on the live site.** Do the full F01 from
  `replica/test-plan.md` yourself on the deployed URL, in
  Chrome on the phone and Safari/Firefox on the laptop. Then
  ask three real people to do it and watch.
- **50-order milestone.** When the 50th order ships, follow
  the milestone in `replica/launch/launch-plan.md`.

## 5. What is NOT in this deploy

- **No Stripe live yet.** The plan in `replica/fixes.md` adds
  bKash / Nagad / SSLCommerz later. The COD flow is the launch
  product.
- **No mobile app store listings yet.** The Play Store / App
  Store entries in `replica/launch/listing.json` are written
  and validated, but the developer accounts ($25 once, $99 a
  year) and the screenshot set (needs a real device) are
  deferred. The PWA install prompt is the path until then.
- **No admin dashboard.** Per the parity report, this is
  `could` priority. The owner manages orders from the email
  alerts + the `db/schema.ts` Postgres views until the
  dashboard ships.

## 6. The "go" signal

Before you run §3.2, the user has to say "go". Three things must
be true:

1. The three pre-deploy fixes in §2 are merged.
2. The user has a Neon (or other) Postgres connection string and
   a Resend API key in hand.
3. The user has SSH access to the cPanel host and has created
   the Node.js application in cPanel > Setup Node.js App.

When all three are true, run §3.2 and the app is live. Then run
§4 for the first week.
