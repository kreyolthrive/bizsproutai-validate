#!/usr/bin/env bash
set -euo pipefail

if command -v semgrep >/dev/null 2>&1; then
  semgrep scan --config auto "${1:-.}"
  exit 0
fi

echo "Semgrep CLI not found. Install with one of:"
echo "  1) python3 -m pip install semgrep"
echo "  2) brew install semgrep"
echo "  3) docker run --rm semgrep/semgrep semgrep --version"

if [[ "${SEMGREP_REQUIRED:-false}" == "true" ]]; then
  exit 1
fi

exit 0
