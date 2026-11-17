#!/usr/bin/env bash
# Optional, reproducible dev-container setup for Graphify and UI UX Pro Max. NOT run automatically and NOT part of the app.
# Review before running: it installs global CLI tools. Idempotent; never overwrites existing config (the PATH line is added only if missing).
set -euo pipefail
BIN="$HOME/.local/bin"

# 1. Graphify CLI (uv tool). Install uv first if it is missing: https://docs.astral.sh/uv/
if ! command -v graphify >/dev/null 2>&1 && [ ! -x "$BIN/graphify" ]; then
  command -v uv >/dev/null 2>&1 || { echo "uv is required: install it first (see link above)" >&2; exit 1; }
  uv tool install graphifyy
fi

# 2. UI UX Pro Max CLI (npm) + its global Claude skills. `uipro init` only runs when its skill folder is absent, so existing global config is kept.
if ! command -v uipro >/dev/null 2>&1; then
  command -v npm >/dev/null 2>&1 || { echo "npm is required" >&2; exit 1; }
  npm install -g ui-ux-pro-max-cli
fi
[ -d "$HOME/.claude/skills/ui-ux-pro-max" ] || (cd "$HOME" && uipro init --ai claude --global)

# 3. PATH: make ~/.local/bin available in future shells (added once).
grep -qs '\.local/bin' "$HOME/.bashrc" 2>/dev/null || echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
export PATH="$BIN:$PATH"

echo "graphify:  $(command -v graphify || echo missing)"
echo "uipro:     $(command -v uipro || echo missing)"
echo "ui-ux-pro-max skill: $([ -d "$HOME/.claude/skills/ui-ux-pro-max" ] && echo present || echo missing)"
