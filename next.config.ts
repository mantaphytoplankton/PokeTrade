import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright's dev webServer (playwright.config.ts) drives the app over
  // 127.0.0.1; Next 16 blocks cross-origin dev requests (HMR) by default.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
