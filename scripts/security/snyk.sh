#!/usr/bin/env bash
set -euo pipefail

if ! command -v snyk >/dev/null 2>&1; then
  echo "snyk CLI is not installed. Run: pnpm add -D snyk"
  exit 1
fi

if [[ -z "${SNYK_TOKEN:-}" ]]; then
  echo "SNYK_TOKEN is not set. Skipping Snyk scan."
  exit 0
fi

mkdir -p .cache/snyk
export SNYK_CACHE_PATH="${SNYK_CACHE_PATH:-$PWD/.cache/snyk}"
export SNYK_DISABLE_ANALYTICS=1

snyk auth "$SNYK_TOKEN" >/dev/null 2>&1 || true
snyk test "$@"
