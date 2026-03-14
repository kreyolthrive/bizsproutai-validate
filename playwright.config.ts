import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30_000,
  reporter: [["list"]],
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3001",
    url: "http://localhost:3001/icon.svg",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3001",
    trace: "retain-on-failure"
  }
});
