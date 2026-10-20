import { test, expect, ADDRESS, PRODUCTS, addToCartFromShop, alerts, bdt, fillOrderForm } from "./support";

// F01 — Guest browses and orders with Cash on Delivery.
// Cases: replica/test-plan.md F01-H1, E1–E7, E11, E12, E14, E16, N1–N4, N7.

test.describe("F01 guest order (COD)", () => {
  test("F01-H1 happy path: home → shop → product → cart → checkout → confirmation", async ({ page, guards }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("link", { name: "শপ" }).first().click();
    await expect(page).toHaveURL(/\/shop/);

    await page.getByRole("link", { name: PRODUCTS.inStock.name }).first().click();
    await expect(page).toHaveURL(new RegExp(`/p/${PRODUCTS.inStock.slug}`));

    await page.getByRole("button", { name: /কার্টে যোগ করুন/ }).first().click();
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await expect(page.getByRole("dialog", { name: "কার্ট" })).toBeVisible();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();

    await expect(page).toHaveURL(/\/checkout/);
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });
    const submit = page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ });
    await expect(submit).toBeVisible();
    await submit.click();

    await expect(page).toHaveURL(/\/order\/RF-/);
    await expect(page.getByRole("heading", { name: "অর্ডার সফল হয়েছে!" })).toBeVisible();
    await expect(page.getByText(/RF-\d{8}-\d{4}/)).toBeVisible();

    await guards.axe("order confirmation");
  });

  test("F01-E1 empty cart checkout shows empty state, no form", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText("আপনার কার্টে কোনো পণ্য নেই")).toBeVisible();
    await expect(page.getByLabel("আপনার নাম")).toHaveCount(0);
  });

  test("F01-E2 cart survives a reload", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.inStock.name);
    await page.reload();
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await expect(page.getByRole("dialog", { name: "কার্ট" }).getByText(PRODUCTS.inStock.name)).toBeVisible();
  });

  test("F01-E3 free delivery above ৳১৯৯৯", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.inStock.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });

    await expect(page.getByText("শিপিং চার্জ").locator("..")).toContainText("ফ্রি");
    const total = PRODUCTS.inStock.price;
    await expect(page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ })).toContainText(bdt(total));
  });

  test("F01-E4 inside-Dhaka shipping ৳৮০ below the threshold", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });

    await expect(page.getByText("শিপিং চার্জ").locator("..")).toContainText(bdt(8000));
    await expect(page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ })).toContainText(
      bdt(PRODUCTS.cheap.price + 8000)
    );
  });

  test("F01-E5 outside-Dhaka shipping ৳১৫০", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "চট্টগ্রাম" });

    await expect(page.getByText("শিপিং চার্জ").locator("..")).toContainText(bdt(15000));
    await expect(page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ })).toContainText(
      bdt(PRODUCTS.cheap.price + 15000)
    );
  });

  test("F01-E6 WELCOME10 takes 10% off", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });

    await page.getByLabel("কুপন কোড আছে?").fill("WELCOME10");
    await page.getByRole("button", { name: "প্রয়োগ" }).click();

    const discount = Math.floor(PRODUCTS.cheap.price * 0.1);
    await expect(page.getByText(/ছাড় প্রয়োগ হয়েছে/)).toBeVisible();
    await expect(page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ })).toContainText(
      bdt(PRODUCTS.cheap.price + 8000 - discount)
    );
  });

  test("F01-E7 invalid coupon keeps the total", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });

    await page.getByLabel("কুপন কোড আছে?").fill("NOPE");
    await page.getByRole("button", { name: "প্রয়োগ" }).click();
    await expect(page.getByText("কুপন কোডটি সঠিক নয়")).toBeVisible();
    await expect(page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ })).toContainText(
      bdt(PRODUCTS.cheap.price + 8000)
    );
  });

  test("F01-E11 refresh mid-flow keeps the cart, creates no order", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });
    await page.reload();

    await expect(page.getByLabel("আপনার নাম")).toHaveValue("");
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await expect(page.getByRole("dialog", { name: "কার্ট" }).getByText(PRODUCTS.cheap.name)).toBeVisible();
  });

  test("F01-E12 double submit creates exactly one order", async ({ page }) => {
    let posts = 0;
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().includes("/api/orders")) posts += 1;
    });

    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.type === "submit");
      btn?.click();
      btn?.click();
    });

    await expect(page).toHaveURL(/\/order\/RF-/);
    expect(posts, "POST /api/orders count").toBe(1);
  });

  test("F01-E14 mobile 390px layout holds", async ({ page, guards }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await addToCartFromShop(page, PRODUCTS.inStock.name);

    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(390);

    await page.getByRole("navigation", { name: "প্রধান" }).getByRole("button", { name: /কার্ট/ }).click();
    await expect(page.getByRole("dialog", { name: "কার্ট" })).toBeVisible();
    await guards.axe("cart drawer (mobile)");
  });

  test("F01-E16 checkout form is labelled and axe-clean", async ({ page, guards }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await expect(page.getByLabel("আপনার নাম")).toBeVisible();
    await expect(page.getByLabel("ডেলিভারি ঠিকানা")).toBeVisible();
    await guards.axe("checkout");
  });

  test("F01-N1 bad phone blocks the order", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)", phone: "01112345678" });
    await page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ }).click();

    await expect(alerts(page)).toContainText("সঠিক মোবাইল নম্বর");
    await expect(page).toHaveURL(/\/checkout/);
  });

  test("F01-N2 short name blocks the order", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)", name: "ক" });
    await page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ }).click();

    await expect(alerts(page)).toContainText("আপনার নাম লিখুন");
  });

  test("F01-N3 missing district blocks the order", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { address: ADDRESS });
    await page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ }).click();

    await expect(alerts(page)).toContainText("জেলা নির্বাচন করুন");
  });

  test("F01-N4 short address blocks the order", async ({ page }) => {
    await addToCartFromShop(page, PRODUCTS.cheap.name);
    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    await page.getByRole("link", { name: "চেকআউট করুন" }).click();
    await fillOrderForm(page, { district: "ঢাকা (সিটি)", address: "ঢাকা" });
    await page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ }).click();

    await expect(alerts(page)).toContainText("সম্পূর্ণ ঠিকানা লিখুন");
  });

  test("F01-N6 API rejects a malformed body with 422", async ({ page }) => {
    const res = await page.request.post("/api/orders", { data: { customerName: "ক" } });
    expect(res.status()).toBe(422);
    expect((await res.json()).error).toBeTruthy();
  });

  test("F01-N7 API rate-limits a burst of orders", async ({ page }) => {
    const headers = { "x-forwarded-for": "203.0.113.7" };
    let saw429 = false;
    for (let i = 0; i < 12; i++) {
      // A body the schema rejects (422): it still counts against the limiter,
      // without creating orders or consuming stock for later tests.
      const res = await page.request.post("/api/orders", {
        headers,
        data: { customerName: "ক" },
      });
      if (res.status() === 429) {
        saw429 = true;
        break;
      }
    }
    expect(saw429, "expected a 429 within 12 rapid posts from one IP").toBe(true);
  });
});
