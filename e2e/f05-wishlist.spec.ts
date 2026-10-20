import { test, expect, PRODUCTS } from "./support";

// F05 — Wishlist (guest, localStorage).
// Cases: F05-H1, E1–E3.

test.describe("F05 wishlist", () => {
  test("F05-H1 heart a card, then see it in the wishlist", async ({ page, guards }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: `${PRODUCTS.inStock.name} — পছন্দের তালিকায় রাখুন` }).click();
    await expect(page.getByText("পছন্দের তালিকায় রাখা হয়েছে")).toBeVisible();

    await page.goto("/wishlist");
    await expect(page.getByRole("heading", { name: "পছন্দের তালিকা" })).toBeVisible();
    await expect(page.getByRole("link", { name: PRODUCTS.inStock.name }).first()).toBeVisible();
    await guards.axe("wishlist");
  });

  test("F05-E1 empty wishlist state", async ({ page }) => {
    await page.goto("/wishlist");
    await expect(page.getByText("আপনার পছন্দের তালিকা খালি")).toBeVisible();
    await expect(page.getByRole("link", { name: "কেনাকাটা শুরু করুন" })).toBeVisible();
  });

  test("F05-E2 toggle off removes it", async ({ page }) => {
    await page.goto("/shop");
    const heart = page.getByRole("button", {
      name: `${PRODUCTS.inStock.name} — পছন্দের তালিকায় রাখুন`,
    });
    await heart.click();
    await page.getByRole("button", { name: `${PRODUCTS.inStock.name} — পছন্দের তালিকা থেকে সরান` }).click();

    await page.goto("/wishlist");
    await expect(page.getByText("আপনার পছন্দের তালিকা খালি")).toBeVisible();
  });

  test("F05-E3 wishlist survives a reload", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: `${PRODUCTS.cheap.name} — পছন্দের তালিকায় রাখুন` }).click();
    await page.goto("/wishlist");
    await page.reload();
    await expect(page.getByRole("link", { name: PRODUCTS.cheap.name }).first()).toBeVisible();
  });
});
