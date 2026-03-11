import { check, sleep } from "k6";
import http from "k6/http";

const targetUrl = __ENV.K6_TARGET_URL;

export const options = {
  vus: Number(__ENV.K6_VUS || 1),
  duration: __ENV.K6_DURATION || "10s"
};

export default function () {
  if (!targetUrl) {
    console.log("K6_TARGET_URL is not set, skipping HTTP request checks.");
    sleep(1);
    return;
  }

  const response = http.get(targetUrl);

  check(response, {
    "status is below 500": (res) => res.status < 500
  });

  sleep(1);
}
