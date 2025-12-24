#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DIST_DIR="${DIST_DIR:-dist}"
TAG_NAME="${TAG_NAME:-stage1}"

mkdir -p "$DIST_DIR"

echo "==> Building node (release)"
cargo build --release --package myl1-node-cli

echo "==> Copying binary"
cp -f ./target/release/myl1-node "$DIST_DIR/myl1-node"

echo "==> Generating chain spec(s)"
./target/release/myl1-node build-spec --chain local --raw > "$DIST_DIR/myl1-local-raw.json"
./target/release/myl1-node build-spec --chain dev --raw > "$DIST_DIR/myl1-dev-raw.json"

echo "==> Collecting runtime Wasm (best-effort)"
RUNTIME_WASM="$(find ./target -type f \\( -name 'myl1_runtime*.compact*.wasm' -o -name 'myl1_runtime*.wasm' \\) 2>/dev/null | head -n 1 || true)"
if [ -n "$RUNTIME_WASM" ]; then
  cp -f "$RUNTIME_WASM" "$DIST_DIR/$(basename "$RUNTIME_WASM")"
  echo "    Found: $RUNTIME_WASM"
else
  echo "    (not found yet) build should produce it under target/**/wbuild/**"
fi

echo "==> Writing checksums"
(cd "$DIST_DIR" && sha256sum * > SHA256SUMS.txt)

ARCHIVE="${TAG_NAME}.tar.gz"
echo "==> Creating archive: $DIST_DIR/$ARCHIVE"
tar -C "$DIST_DIR" -czf "$DIST_DIR/$ARCHIVE" .

echo "==> Done"
echo "Artifacts in: $DIST_DIR"


