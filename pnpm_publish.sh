#!/usr/bin/env bash
# pnpm_publish.sh — publishes all workspace packages to npm in dependency order
#
# prerequisites:
#   - pnpm is installed and available in PATH
#   - you are logged in to npm  (run "pnpm login" once if needed)
#   - all packages have been built  (run builds before calling this script)
#
# usage:
#   chmod +x pnpm_publish.sh
#   ./pnpm_publish.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# check login status before attempting any publish
if ! pnpm whoami &>/dev/null; then
  echo "error: not logged in to npm — run 'pnpm login' first" >&2
  exit 1
fi

echo "logged in as: $(pnpm whoami)"

publish () {
  local pkg="$1"
  echo ""
  echo "▶  publishing $pkg …"
  (cd "$REPO_ROOT/packages/$pkg" && pnpm publish --no-git-checks)
}

# tier 1 — no workspace dependencies
publish core

# tier 2 — depend on core
publish core-jj
publish core-loro
publish core-yjs

# tier 3 — depend on core + backends
publish sync-engine
publish network-websocket
publish network-webrtc
publish persistence-browser
publish persistence-node

# tier 4 — depend on everything above
publish browser-bundle-jj
publish browser-bundle-loro
publish browser-bundle-yjs
publish websocket-server

echo ""
echo "✓  all packages published."
