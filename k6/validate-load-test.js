/**
 * k6 load test for /api/validate
 *
 * Install: brew install k6  (or: npm install -g k6)
 * Run:     k6 run k6/validate-load-test.js
 * Env:     k6 run -e BASE_URL=https://validate.bizsproutai.com k6/validate-load-test.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const validationDuration = new Trend("validation_duration", true);
const validationErrors = new Rate("validation_errors");

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "30s", target: 3 }, // Warm up
    { duration: "2m", target: 5 }, // Steady state
    { duration: "1m", target: 10 }, // Peak
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<35000"], // 95th percentile under 35s
    http_req_failed: ["rate<0.15"], // Less than 15% failure (some 429s expected)
    validation_errors: ["rate<0.1"], // Less than 10% actual errors
  },
};

const locales = ["en", "fr", "es", "pt", "ht"];
const ideas = [
  "A mobile app for local farmers to sell produce directly to consumers",
  "An AI-powered tutoring platform for high school students",
  "A subscription box service for sustainable household products",
  "A freelance marketplace connecting graphic designers with small businesses",
  "A SaaS tool for barbershops to manage appointments and client history",
  "A coaching platform for first-time real estate agents",
  "An inventory management app for small retail shops",
  "A wellness app focused on stress management for remote workers",
];

export default function () {
  const locale = locales[Math.floor(Math.random() * locales.length)];
  const idea = ideas[Math.floor(Math.random() * ideas.length)];

  const payload = JSON.stringify({
    email: `loadtest+vu${__VU}iter${__ITER}@example.com`,
    idea: idea,
    locale: locale,
    _formTimingMs: 5000 + Math.random() * 10000, // Simulate human timing
  });

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/validate`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: "60s",
  });
  const duration = Date.now() - start;
  validationDuration.add(duration);

  const isSuccess = res.status === 200;
  const isRateLimited = res.status === 429;
  const isError = !isSuccess && !isRateLimited;
  validationErrors.add(isError);

  check(res, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
    "has requestId": (r) => {
      try {
        return JSON.parse(r.body).requestId !== undefined;
      } catch {
        return false;
      }
    },
    "200 response has ok:true": (r) => {
      if (r.status !== 200) return true; // skip for non-200
      try {
        return JSON.parse(r.body).ok === true;
      } catch {
        return false;
      }
    },
  });

  // Vary sleep to simulate real user patterns
  sleep(Math.random() * 8 + 3); // 3-11 seconds between requests
}
