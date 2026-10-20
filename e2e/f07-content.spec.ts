import { test, expect } from "./support";

// F07 — Read content / policy.
// Cases: F07-H1, E1, E2, X-SEO.

test.describe("F07 content and policies", () => {
  test("F07-H1 delivery policy renders the zones and fees", async ({ page, guards }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /ডেলিভারি/ }).first().click();
    await expect(page).toHaveURL(/\/delivery-policy/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/৮০/).first()).toBeVisible();
    await guards.axe("delivery policy");
  });

  test("F07-E1 blog index opens a post", async ({ page, guards }) => {
    await page.goto("/blog");
    await page.getByRole("link", { name: /ঘর সাজাবেন ফুল/ }).first().click();
    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await guards.axe("blog post");
  });

  test("F07-E2 unknown blog slug 404s", async ({ page }) => {
    const res = await page.request.get("/blog/does-not-exist");
    expect(res.status()).toBe(404);
  });

  test("X-SEO sitemap and robots answer 200", async ({ page }) => {
    const sitemap = await page.request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("/shop");

    const robots = await page.request.get("/robots.txt");
    expect(robots.status()).toBe(200);
  });
});
