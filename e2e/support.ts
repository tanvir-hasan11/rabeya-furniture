import { chromium, test as base, expect, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Custom fixtures shared by every spec:
//  - fails the test if the page logged a console error or threw
//  - fails the test if any response was 5xx
//  - `axe(name)` runs an accessibility scan of the current screen
export type Guards = {
  consoleErrors: string[];
  serverErrors: string[];
  ip: string;
  axe: (name: string) => Promise<void>;
};

let ipCounter = 0;
/** A unique client IP per test, so per-IP rate limits never leak between tests. */
export function uniqueIp(): string {
  ipCounter += 1;
  return `10.90.${Math.floor(ipCounter / 250)}.${(ipCounter % 250) + 1}`;
}

export const test = base.extend<{ guards: Guards; browser: Browser }>({
  // On a musl/Alpine runner Playwright's bundled Chromium cannot launch, so
  // connect to a system Chromium over CDP when PLAYWRIGHT_CDP_WS is set.
  browser: async ({}, use) => {
    const ws = process.env.PLAYWRIGHT_CDP_WS;
    const browser = ws ? await chromium.connectOverCDP(ws) : await chromium.launch();
    await use(browser);
    await browser.close();
  },

  guards: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const serverErrors: string[] = [];
    const ip = uniqueIp();
    await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
    page.on("response", (res) => {
      if (res.status() >= 500) serverErrors.push(`${res.status()} ${res.url()}`);
    });

    const guards: Guards = {
      consoleErrors,
      serverErrors,
      ip,
      axe: async (name: string) => {
        const results = await new AxeBuilder({ page }).analyze();
        expect(
          results.violations.map((v) => `${v.id}: ${v.help}`),
          `axe violations on ${name}`
        ).toEqual([]);
      },
    };

    await use(guards);

    expect.soft(consoleErrors, "console errors").toEqual([]);
    expect.soft(serverErrors, "5xx responses").toEqual([]);
  },
});

export { expect };

export const PRODUCTS = {
  inStock: { name: "পুষ্পনিবাস ডেকর সেট", slug: "pushponibash-decor-set", price: 249900 },
  highStock: { name: "প্রিমিয়াম বার্ড নেস্ট", productId: "p-bird-nest", slug: "premium-bird-nest" },
  lowStock: { name: "এরিকা পাম বড় টব সহ", slug: "premium-areca-palm", price: 120000, stock: 2 },
  outOfStock: { name: "টেরাকোটা ফুলদানি", slug: "terracotta-flower-vase" },
  cheap: { name: "সিরামিক টবে অর্কিড", slug: "orchid-ceramic-pot", price: 75000 },
} as const;

export const ADDRESS = "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা";

/** Form error messages. Next's route announcer is also role="alert", so exclude it. */
export function alerts(page: Page) {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)');
}

export function bdt(poisha: number): string {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const taka = Math.round(poisha) / 100;
  return `৳${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 })
    .format(taka)
    .replace(/[0-9]/g, (d) => bn[Number(d)])}`;
}

/** Add a product to the cart from /shop, by card button name. */
export async function addToCartFromShop(page: Page, name: string) {
  await page.goto("/shop");
  await page.getByRole("button", { name: `${name} — কার্টে যোগ করুন` }).click();
}

/** Fill the checkout/inline order form. */
export async function fillOrderForm(
  page: Page,
  opts: { name?: string; phone?: string; district?: string; address?: string } = {}
) {
  await page.getByLabel("আপনার নাম").fill(opts.name ?? "টেস্ট গ্রাহক");
  await page.getByLabel("মোবাইল নম্বর").fill(opts.phone ?? "01712345678");
  if (opts.district !== undefined) {
    await page.getByLabel("জেলা নির্বাচন করুন").selectOption({ label: opts.district });
  }
  await page.getByLabel("ডেলিভারি ঠিকানা").fill(opts.address ?? ADDRESS);
}

/** Place an order through the API and return its order number. */
export async function placeOrderViaApi(
  page: Page,
  items: { productId: string; qty: number }[],
  opts: { couponCode?: string; ip?: string } = {}
): Promise<string> {
  const { ip, ...body } = opts;
  const res = await page.request.post("/api/orders", {
    headers: ip ? { "x-forwarded-for": ip } : undefined,
    data: {
      customerName: "এপিআই গ্রাহক",
      phone: "01712345678",
      districtId: "d-dhaka",
      address: ADDRESS,
      paymentMethod: "cod",
      source: "cart",
      items,
      ...body,
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  const json = await res.json();
  return json.orderNumber as string;
}
