import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      // Isolated data dir so E2E runs never touch real app data —
      // common-test-strategy: "isolated data dir over silent no-op mocks".
      POKETRADE_DATA_ROOT: path.join(__dirname, ".e2e-data"),
      SESSION_SECRET: "e2e-test-secret-not-for-prod",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
