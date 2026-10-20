import { test, expect, PRODUCTS, alerts, fillOrderForm } from "./support";

// F03 — Direct order from the product page (no cart).
// Cases: F03-H1, E1, E2, E3, E4, N1.

test.describe("F03 direct order from the product page", () => {
  test("F03-H1 orders straight from the product page", async ({ page, guards }) => {
    await page.goto(`/p/${PRODUCTS.inStock.slug}`);
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });
    await page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ }).click();

    await expect(page).toHaveURL(/\/order\/RF-/);
    await expect(page.getByRole("heading", { name: "অর্ডার সফল হয়েছে!" })).toBeVisible();
    await guards.axe("product page");
  });

  test("F03-E1 low stock shows the remaining count", async ({ page }) => {
    await page.goto(`/p/${PRODUCTS.lowStock.slug}`);
    await expect(page.getByText(/বাকি/).first()).toBeVisible();
  });

  test("F03-E2 online payment is disabled, COD stays selected", async ({ page }) => {
    await page.goto(`/p/${PRODUCTS.inStock.slug}`);
    const online = page.getByRole("radio", { name: /অনলাইন/ });
    await expect(online).toBeDisabled();
    await expect(page.getByRole("radio", { name: /ক্যাশ অন ডেলিভারি/ })).toBeChecked();
  });

  test("F03-E3 coupon works in the inline form", async ({ page }) => {
    await page.goto(`/p/${PRODUCTS.cheap.slug}`);
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });
    await page.getByLabel("কুপন কোড আছে?").fill("WELCOME10");
    await page.getByRole("button", { name: "প্রয়োগ" }).click();
    await expect(page.getByText(/ছাড় প্রয়োগ হয়েছে/)).toBeVisible();
  });

  test("F03-E4 double submit creates one order", async ({ page }) => {
    let posts = 0;
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().includes("/api/orders")) posts += 1;
    });

    await page.goto(`/p/${PRODUCTS.inStock.slug}`);
    await fillOrderForm(page, { district: "ঢাকা (সিটি)" });
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => b.type === "submit" && /অর্ডার নিশ্চিত/.test(b.textContent ?? "")
      );
      btn?.click();
      btn?.click();
    });

    await expect(page).toHaveURL(/\/order\/RF-/);
    expect(posts).toBe(1);
  });

  test("F03-N1 bad phone blocks the direct order", async ({ page }) => {
    await page.goto(`/p/${PRODUCTS.inStock.slug}`);
    await fillOrderForm(page, { district: "ঢাকা (সিটি)", phone: "0123456789" });
    await page.getByRole("button", { name: /অর্ডার নিশ্চিত করুন/ }).click();
    await expect(alerts(page)).toContainText("সঠিক মোবাইল নম্বর");
    await expect(page).toHaveURL(/\/p\//);
  });
});
