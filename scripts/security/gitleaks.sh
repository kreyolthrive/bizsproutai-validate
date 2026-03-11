#!/usr/bin/env bash
set -euo pipefail

if command -v gitleaks >/dev/null 2>&1; then
  config_args=()
  if [[ -f .gitleaks.toml ]]; then
    config_args=(--config .gitleaks.toml)
  fi
  gitleaks "$([[ -d .git ]] && echo git || echo dir)" . "${config_args[@]}" --verbose "$@"
  exit 0
fi

if ! command -v gitleaks-secret-scanner >/dev/null 2>&1; then
  echo "No gitleaks scanner found. Install with: pnpm add -D gitleaks-secret-scanner"
  exit 1
fi

cache_root="${HOME}/.gitleaks-cache"
gitleaks_bin="$(find "$cache_root" -type f -name gitleaks 2>/dev/null | sort | tail -n 1 || true)"

if [[ -z "$gitleaks_bin" ]]; then
  gitleaks-secret-scanner --install-only >/dev/null 2>&1
  gitleaks_bin="$(find "$cache_root" -type f -name gitleaks 2>/dev/null | sort | tail -n 1 || true)"
fi

if [[ -z "$gitleaks_bin" || ! -x "$gitleaks_bin" ]]; then
  echo "Unable to locate gitleaks binary in ${cache_root}."
  exit 1
fi

config_args=()
if [[ -f .gitleaks.toml ]]; then
  config_args=(--config .gitleaks.toml)
fi

"$gitleaks_bin" "$([[ -d .git ]] && echo git || echo dir)" . "${config_args[@]}" --verbose "$@"
