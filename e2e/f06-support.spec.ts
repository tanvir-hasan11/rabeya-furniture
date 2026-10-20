import { test, expect } from "./support";

// F06 — Contact / support handoff.
// Cases: F06-H1, E1, E2.

test.describe("F06 support handoff", () => {
  test("F06-H1 live chat page offers WhatsApp and a call", async ({ page, guards }) => {
    await page.goto("/live-chat");
    await expect(page.getByRole("heading", { name: /লাইভ চ্যাট সাপোর্ট/ })).toBeVisible();

    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: /হোয়াটসঅ্যাপে চ্যাট করুন/ })).toBeVisible();
    await expect(main.getByRole("link", { name: /সরাসরি কল করুন/ })).toBeVisible();
    await guards.axe("live chat");
  });

  test("F06-H1b mobile bottom nav reaches live chat", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("navigation", { name: "প্রধান" }).getByRole("link", { name: "লাইভ চ্যাট" }).click();
    await expect(page).toHaveURL(/\/live-chat/);
  });

  test("F06-E1 call action is a tel: link", async ({ page }) => {
    await page.goto("/live-chat");
    const call = page.getByRole("main").getByRole("link", { name: /সরাসরি কল করুন/ });
    await expect(call).toHaveAttribute("href", /^tel:/);
  });

  test("F06-E2 chat action is a wa.me link with the store number", async ({ page }) => {
    await page.goto("/live-chat");
    const chat = page.getByRole("main").getByRole("link", { name: /হোয়াটসঅ্যাপে চ্যাট করুন/ });
    await expect(chat).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+$/);
  });
});
