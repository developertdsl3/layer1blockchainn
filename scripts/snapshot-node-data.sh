#!/bin/bash
set -euo pipefail

# Simple snapshot script for a node base-path.
# Usage:
#   ./scripts/snapshot-node-data.sh /path/to/base-path ./snapshots

BASE_PATH="${1:-}"
OUT_DIR="${2:-./snapshots}"

if [ -z "$BASE_PATH" ]; then
  echo "Usage: $0 /path/to/base-path [out-dir]"
  exit 1
fi

if [ ! -d "$BASE_PATH" ]; then
  echo "Base path not found: $BASE_PATH"
  exit 1
fi

mkdir -p "$OUT_DIR"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="$OUT_DIR/myl1-node-snapshot-$TS.tar.gz"

echo "==> Creating snapshot: $ARCHIVE"
tar -C "$BASE_PATH" -czf "$ARCHIVE" .
sha256sum "$ARCHIVE" > "$ARCHIVE.sha256"
echo "==> Done"


