#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${ZAP_TARGET_URL:-}" ]]; then
  echo "ZAP_TARGET_URL is not set. Skipping OWASP ZAP baseline scan."
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Cannot run OWASP ZAP scan."
  exit 0
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Cannot run OWASP ZAP scan."
  exit 0
fi

docker run --rm -t owasp/zap2docker-stable zap-baseline.py -t "$ZAP_TARGET_URL"
