import { test, expect, PRODUCTS } from "./support";

// F02 — Quick add to cart from a listing card.
// Cases: F02-H1, E1, E2, E3.

test.describe("F02 quick add from a card", () => {
  test("F02-H1 adds without leaving the listing", async ({ page, guards }) => {
    await page.goto("/shop");
    const add = page.getByRole("button", { name: `${PRODUCTS.inStock.name} — কার্টে যোগ করুন` });
    await add.click();

    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByText("কার্টে যোগ হয়েছে")).toBeVisible();
    await expect(page.getByRole("button", { name: /কার্ট খুলুন, ১টি পণ্য/ })).toBeVisible();
    await guards.axe("shop listing");
  });

  test("F02-E1 out-of-stock card is disabled", async ({ page }) => {
    await page.goto("/shop");
    const btn = page.getByRole("button", { name: `${PRODUCTS.outOfStock.name} স্টক শেষ` });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });

  test("F02-E2 adding twice makes one line with qty 2", async ({ page }) => {
    await page.goto("/shop");
    const add = page.getByRole("button", { name: `${PRODUCTS.cheap.name} — কার্টে যোগ করুন` });
    await add.click();
    await add.click();

    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    const drawer = page.getByRole("dialog", { name: "কার্ট" });
    await expect(drawer.getByText(PRODUCTS.cheap.name)).toHaveCount(1);
    await expect(drawer.getByLabel(/পরিমাণ/).first()).toContainText("২");
  });

  test("F02-E3 quantity is capped at available stock", async ({ page }) => {
    await page.goto("/shop");
    const add = page.getByRole("button", { name: `${PRODUCTS.lowStock.name} — কার্টে যোগ করুন` });
    await add.click();
    await add.click();
    await add.click();

    await page.getByRole("button", { name: /কার্ট খুলুন/ }).click();
    const drawer = page.getByRole("dialog", { name: "কার্ট" });
    await expect(drawer.getByText(PRODUCTS.lowStock.name)).toBeVisible();

    const group = drawer.getByRole("group", { name: /পরিমাণ/ }).first();
    await expect(group).toContainText("২");
    await expect(group.getByRole("button", { name: "পরিমাণ বাড়ান" })).toBeDisabled();
  });
});
