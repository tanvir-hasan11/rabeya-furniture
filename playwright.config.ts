import { defineConfig, devices } from "@playwright/test";

// E2E config. On a normal machine this launches Playwright's own Chromium.
// On a musl/Alpine runner (like this device) that build cannot start, so the
// suite connects to a system Chromium over CDP instead — see e2e/support.ts
// (browser fixture) and e2e/run.sh.
const PORT = process.env.PLAYWRIGHT_PORT ?? "3510";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: `npm run dev -- -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
