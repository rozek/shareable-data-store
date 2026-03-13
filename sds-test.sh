#!/usr/bin/env bash

# sds-test.sh
#
# Creates an "sds-test" item in a store and populates it with items and links
# that exercise every sds-command function (except server-dependent operations,
# large values, and --file).
#
# Usage:
#   bash sds-test.sh [<store-id> [<npm-package>]]
#
# Examples:
#   bash sds-test.sh                                  # store: sds-test,  pkg: @rozek/sds-command-jj
#   bash sds-test.sh my-store                         # store: my-store,  pkg: @rozek/sds-command-jj
#   bash sds-test.sh my-store @rozek/sds-command-yjs  # store: my-store,  pkg: sds-command-yjs

set -euo pipefail

STORE="${1:-sds-test}"
PKG="${2:-@rozek/sds-command-jj}"

#───────────────────────────────────────────────────────────────────────────────
# helpers
#───────────────────────────────────────────────────────────────────────────────

# extract "id" from sds JSON output — no external tools needed
json_id() { printf '%s' "$1" | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//g'; }

# run a command with visible echo
run() {
  echo "  \$ npx $PKG --store $STORE $*"
  npx "$PKG" --store "$STORE" "$@"
}

# run with --format json, return raw output (used when capturing IDs)
runj() { npx "$PKG" --store "$STORE" --format json "$@"; }

section() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  printf   "  %s\n" "$*"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

ok() { echo "  ✓ $*"; }

#───────────────────────────────────────────────────────────────────────────────
# 1. store info (before anything exists)
#───────────────────────────────────────────────────────────────────────────────

section "1. store info (initial)"
run store info
ok "store info"

#───────────────────────────────────────────────────────────────────────────────
# 2. create the "sds-test" container item at root
#───────────────────────────────────────────────────────────────────────────────

section "2. Create 'sds-test' container"

JSON=$(runj entry create --label "sds-test")
TEST_ID=$(json_id "$JSON")
echo "  → $JSON"
ok "entry create (item, label only) → $TEST_ID"

#───────────────────────────────────────────────────────────────────────────────
# 3. create child items inside sds-test
#───────────────────────────────────────────────────────────────────────────────

section "3. entry create — child items"

# item with label + mime + value
JSON=$(runj entry create \
  --container "$TEST_ID" \
  --label     "Text Item" \
  --mime      "text/plain" \
  --value     "Hello, SDS!")
ITEM_TEXT_ID=$(json_id "$JSON")
ok "entry create (label + mime + value) → $ITEM_TEXT_ID"

# item with --info <json>
JSON=$(runj entry create \
  --container "$TEST_ID" \
  --label     "Info Item (JSON)" \
  --mime      "application/json" \
  --value     '{"key":"value"}' \
  --info      '{"author":"alice","status":"draft","priority":1}')
ITEM_INFO_ID=$(json_id "$JSON")
ok "entry create (--info json) → $ITEM_INFO_ID"

# item with --info.<key> notation
JSON=$(runj entry create \
  --container "$TEST_ID" \
  --label     "Info Item (keys)" \
  --info.author  "bob" \
  --info.status  "review" \
  --info.count   42)
ITEM_INFOKEYS_ID=$(json_id "$JSON")
ok "entry create (--info.<key>) → $ITEM_INFOKEYS_ID"

# item inserted at the front (--at 0)
JSON=$(runj entry create \
  --container "$TEST_ID" \
  --label     "First Item" \
  --at        0)
ITEM_FIRST_ID=$(json_id "$JSON")
ok "entry create (--at 0) → $ITEM_FIRST_ID"

# sub-container inside sds-test
JSON=$(runj entry create \
  --container "$TEST_ID" \
  --label     "Sub-Container")
SUB_ID=$(json_id "$JSON")
ok "entry create (sub-container) → $SUB_ID"

# item nested inside the sub-container
JSON=$(runj entry create \
  --container "$SUB_ID" \
  --label     "Nested Item" \
  --mime      "text/plain" \
  --value     "I live inside Sub-Container")
ITEM_NESTED_ID=$(json_id "$JSON")
ok "entry create (item in sub-container) → $ITEM_NESTED_ID"

# item with --info-delete.<key> on create (accepted, no-op — no keys to remove)
JSON=$(runj entry create \
  --container    "$TEST_ID" \
  --label        "Delete-flag on create" \
  --info.color   "red" \
  --info-delete.color)
ITEM_NODELETE_ID=$(json_id "$JSON")
ok "entry create (--info-delete.<key> on new entry — no-op) → $ITEM_NODELETE_ID"

#───────────────────────────────────────────────────────────────────────────────
# 4. create links inside sds-test
#───────────────────────────────────────────────────────────────────────────────

section "4. entry create — links"

# plain link (--target)
JSON=$(runj entry create \
  --container "$TEST_ID" \
  --target    "$ITEM_TEXT_ID" \
  --label     "Link to Text Item")
LINK_TEXT_ID=$(json_id "$JSON")
ok "entry create (link, --target) → $LINK_TEXT_ID"

# link with --info.<key>
JSON=$(runj entry create \
  --container  "$TEST_ID" \
  --target     "$ITEM_INFO_ID" \
  --label      "Link with Info" \
  --info.role  "alias" \
  --info.note  "cross-reference")
LINK_INFO_ID=$(json_id "$JSON")
ok "entry create (link, --target + --info.<key>) → $LINK_INFO_ID"

# link at an explicit position inside sub-container
JSON=$(runj entry create \
  --container "$SUB_ID" \
  --target    "$ITEM_TEXT_ID" \
  --label     "Pinned Link" \
  --at        0)
LINK_PINNED_ID=$(json_id "$JSON")
ok "entry create (link, --at 0 in sub-container) → $LINK_PINNED_ID"

#───────────────────────────────────────────────────────────────────────────────
# 5. entry get — field selection
#───────────────────────────────────────────────────────────────────────────────

section "5. entry get"

echo "  — all fields (item):"
run entry get "$ITEM_TEXT_ID"
ok "entry get (item, all fields)"

echo "  — --kind:"
run entry get "$ITEM_TEXT_ID" --kind
ok "entry get --kind"

echo "  — --label:"
run entry get "$ITEM_TEXT_ID" --label
ok "entry get --label"

echo "  — --mime:"
run entry get "$ITEM_TEXT_ID" --mime
ok "entry get --mime"

echo "  — --value:"
run entry get "$ITEM_TEXT_ID" --value
ok "entry get --value"

echo "  — combined --kind --label --mime --value:"
run entry get "$ITEM_TEXT_ID" --kind --label --mime --value
ok "entry get (multiple flags)"

echo "  — --info (full map):"
run entry get "$ITEM_INFO_ID" --info
ok "entry get --info"

echo "  — --info.<key>:"
run entry get "$ITEM_INFO_ID" --info.author
ok "entry get --info.<key>"

echo "  — all fields (link):"
run entry get "$LINK_TEXT_ID"
ok "entry get (link, all fields)"

echo "  — --target (link):"
run entry get "$LINK_TEXT_ID" --target
ok "entry get --target (link)"

echo "  — entry get with --format json:"
run --format json entry get "$ITEM_INFO_ID" --label --info
ok "entry get (--format json)"

#───────────────────────────────────────────────────────────────────────────────
# 6. entry list
#───────────────────────────────────────────────────────────────────────────────

section "6. entry list"

echo "  — plain list:"
run entry list "$TEST_ID"
ok "entry list (plain)"

echo "  — --label --mime:"
run entry list "$TEST_ID" --label --mime
ok "entry list --label --mime"

echo "  — --value:"
run entry list "$TEST_ID" --value
ok "entry list --value"

echo "  — --info (full map):"
run entry list "$TEST_ID" --info
ok "entry list --info"

echo "  — --info.<key>:"
run entry list "$TEST_ID" --info.author
ok "entry list --info.<key>"

echo "  — --only items:"
run entry list "$TEST_ID" --only items
ok "entry list --only items"

echo "  — --only links:"
run entry list "$TEST_ID" --only links
ok "entry list --only links"

echo "  — --recursive:"
run entry list "$TEST_ID" --recursive --label
ok "entry list --recursive"

echo "  — --recursive --depth 1:"
run entry list "$TEST_ID" --recursive --depth 1 --label
ok "entry list --recursive --depth 1"

echo "  — list root:"
run entry list root --label
ok "entry list root"

echo "  — entry list with --format json:"
run --format json entry list "$TEST_ID" --label --kind
ok "entry list (--format json)"

#───────────────────────────────────────────────────────────────────────────────
# 7. entry update
#───────────────────────────────────────────────────────────────────────────────

section "7. entry update"

echo "  — update label:"
run entry update "$ITEM_TEXT_ID" --label "Updated Text Item"
ok "entry update --label"

echo "  — update mime + value:"
run entry update "$ITEM_TEXT_ID" --mime "text/markdown" --value "**Updated** content"
ok "entry update --mime --value"

echo "  — update with --info json (merge):"
run entry update "$ITEM_INFO_ID" --info '{"status":"final","version":2}'
ok "entry update --info (json merge)"

echo "  — update with --info.<key>:"
run entry update "$ITEM_INFOKEYS_ID" \
  --info.status   "approved" \
  --info.reviewer "carol"
ok "entry update --info.<key>"

echo "  — delete one info key:"
run entry update "$ITEM_INFO_ID" --info-delete.author
ok "entry update --info-delete.<key>"

echo "  — combined: add key + delete key (delete wins on same key):"
run entry update "$ITEM_INFOKEYS_ID" \
  --info.note    "added" \
  --info-delete.count
ok "entry update --info.<key> + --info-delete.<key>"

echo "  — delete-wins conflict (same key in both --info.<key> and --info-delete.<key>):"
run entry update "$ITEM_INFOKEYS_ID" \
  --info.reviewer "dave" \
  --info-delete.reviewer
ok "entry update (delete-wins conflict)"

echo "  — update link label:"
run entry update "$LINK_TEXT_ID" --label "Alias to Text Item"
ok "entry update (link) --label"

echo "  — update link info:"
run entry update "$LINK_INFO_ID" --info.role "bookmark"
ok "entry update (link) --info.<key>"

#───────────────────────────────────────────────────────────────────────────────
# 8. entry move
#───────────────────────────────────────────────────────────────────────────────

section "8. entry move"

echo "  — move ITEM_FIRST to sub-container:"
run entry move "$ITEM_FIRST_ID" --to "$SUB_ID"
ok "entry move --to"

echo "  — move ITEM_FIRST back to sds-test at position 0:"
run entry move "$ITEM_FIRST_ID" --to "$TEST_ID" --at 0
ok "entry move --to --at"

#───────────────────────────────────────────────────────────────────────────────
# 9. tree show
#───────────────────────────────────────────────────────────────────────────────

section "9. tree show"

echo "  — full tree:"
run tree show
ok "tree show"

echo "  — tree with --depth 2:"
run tree show --depth 2
ok "tree show --depth"

echo "  — tree with --format json:"
run --format json tree show --depth 1
ok "tree show (--format json)"

#───────────────────────────────────────────────────────────────────────────────
# 10. store info (mid-run)
#───────────────────────────────────────────────────────────────────────────────

section "10. store info (mid-run)"
run store info
ok "store info"

#───────────────────────────────────────────────────────────────────────────────
# 11. entry delete / trash / restore / purge
#───────────────────────────────────────────────────────────────────────────────

section "11. entry delete / trash / restore / purge"

echo "  — soft-delete ITEM_NESTED (moves to trash):"
run entry delete "$ITEM_NESTED_ID"
ok "entry delete"

echo "  — trash list:"
run trash list
ok "trash list"

echo "  — trash list --only items:"
run trash list --only items
ok "trash list --only items"

echo "  — trash list --only links:"
run trash list --only links
ok "trash list --only links"

echo "  — restore ITEM_NESTED to sds-test (default container = root would be wrong, use TEST_ID):"
run entry restore "$ITEM_NESTED_ID" --to "$TEST_ID"
ok "entry restore --to"

echo "  — delete ITEM_NESTED again:"
run entry delete "$ITEM_NESTED_ID"

echo "  — restore with --at 0:"
run entry restore "$ITEM_NESTED_ID" --to "$TEST_ID" --at 0
ok "entry restore --to --at"

echo "  — delete ITEM_NESTED once more for purge:"
run entry delete "$ITEM_NESTED_ID"

echo "  — purge ITEM_NESTED permanently:"
run entry purge "$ITEM_NESTED_ID"
ok "entry purge"

#───────────────────────────────────────────────────────────────────────────────
# 12. trash purge-expired (with a very long TTL — nothing actually expires)
#───────────────────────────────────────────────────────────────────────────────

section "12. trash purge-expired"
run trash purge-expired --ttl 999999999999
ok "trash purge-expired --ttl"

#───────────────────────────────────────────────────────────────────────────────
# 13. trash purge-all
#───────────────────────────────────────────────────────────────────────────────

section "13. trash purge-all"

echo "  — delete some entries first to populate trash:"
run entry delete "$LINK_PINNED_ID"
run entry delete "$LINK_INFO_ID"
run entry delete "$ITEM_NODELETE_ID"

echo "  — trash list (--format json):"
run --format json trash list
ok "trash list (--format json)"

run trash purge-all
ok "trash purge-all"

#───────────────────────────────────────────────────────────────────────────────
# 14. store export / import
#───────────────────────────────────────────────────────────────────────────────

section "14. store export / import"

EXPORT_JSON="/tmp/sds-test-export.json"
EXPORT_BIN="/tmp/sds-test-export.bin"

echo "  — export JSON:"
run store export --encoding json --output "$EXPORT_JSON"
ok "store export --encoding json --output"

echo "  — export binary:"
run store export --encoding binary --output "$EXPORT_BIN"
ok "store export --encoding binary --output"

echo "  — import from JSON file (CRDT-merge):"
run store import --input "$EXPORT_JSON"
ok "store import (json)"

echo "  — import from binary file (CRDT-merge):"
run store import --input "$EXPORT_BIN"
ok "store import (binary)"

rm -f "$EXPORT_JSON" "$EXPORT_BIN"

#───────────────────────────────────────────────────────────────────────────────
# 15. final state
#───────────────────────────────────────────────────────────────────────────────

section "15. Final state"
run store info
run tree show
ok "final store info + tree"

#───────────────────────────────────────────────────────────────────────────────
# 16. clean up
#───────────────────────────────────────────────────────────────────────────────

section "16. Cleanup"
run store destroy
ok "store destroy"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  All sds-command functions exercised."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
