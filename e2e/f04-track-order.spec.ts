import { test, expect, ADDRESS, PRODUCTS, alerts, placeOrderViaApi } from "./support";

// F04 — Track an order. Requires BOTH the order number and the phone.
// Cases: F04-H1, E1–E3, N1, N2.

async function track(page: import("@playwright/test").Page, number: string, phone: string) {
  await page.goto("/track-order");
  await page.getByLabel("অর্ডার নম্বর").fill(number);
  await page.getByLabel("মোবাইল নম্বর").fill(phone);
  await page.getByRole("button", { name: "ট্র্যাক করুন" }).click();
}

test.describe("F04 track an order", () => {
  test("F04-H1 finds an order with number + phone", async ({ page, guards }) => {
    const number = await placeOrderViaApi(page, [{ productId: PRODUCTS.highStock.productId, qty: 1 }], {
      ip: guards.ip,
    });
    await track(page, number, "01712345678");
    await expect(page.getByText(number)).toBeVisible();
    await expect(page.getByText("ঢাকা (সিটি)")).toBeVisible();
    await guards.axe("track order");
  });

  test("F04-E1 tolerates spaces and dashes in the phone", async ({ page, guards }) => {
    const number = await placeOrderViaApi(page, [{ productId: PRODUCTS.highStock.productId, qty: 1 }], {
      ip: guards.ip,
    });
    await track(page, `  ${number}  `, "017-1234 5678");
    await expect(page.getByText(number)).toBeVisible();
  });

  test("F04-E2 unknown order shows a clear message", async ({ page }) => {
    await track(page, "RF-19990101-9999", "01712345678");
    await expect(alerts(page)).toContainText("কোনো অর্ডার পাওয়া যায়নি");
  });

  test("F04-E3 empty fields are refused", async ({ page }) => {
    await page.goto("/track-order");
    await page.getByRole("button", { name: "ট্র্যাক করুন" }).click();
    await expect(alerts(page)).toContainText("অর্ডার নম্বর ও মোবাইল নম্বর দিন");
  });

  test("F04-N1 right number, wrong phone reveals nothing", async ({ page, guards }) => {
    const number = await placeOrderViaApi(page, [{ productId: PRODUCTS.highStock.productId, qty: 1 }], {
      ip: guards.ip,
    });
    await track(page, number, "01999999999");
    await expect(alerts(page)).toContainText("কোনো অর্ডার পাওয়া যায়নি");
    await expect(page.getByText(ADDRESS)).toHaveCount(0);
  });

  test("F04-N2 rate-limits lookups", async ({ page }) => {
    await page.goto("/track-order");
    const headers = { "x-forwarded-for": "203.0.113.9" };
    let saw429 = false;
    for (let i = 0; i < 25; i++) {
      const res = await page.request.get("/api/orders/track?number=X&phone=Y", { headers });
      if (res.status() === 429) {
        saw429 = true;
        break;
      }
    }
    expect(saw429, "expected a 429 within 25 rapid lookups").toBe(true);
  });
});
