#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ZOMBIENET_BIN="${ZOMBIENET_BIN:-zombienet}"
ZOMBIENET_PROVIDER="${ZOMBIENET_PROVIDER:-native}"
ZOMBIENET_DIR="${ZOMBIENET_DIR:-./zombienet-output}"

echo "==> Checking myl1-node binary"
if [ ! -f "./target/release/myl1-node" ]; then
  echo "Node binary missing. Build it first:"
  echo "  cargo build --release --package myl1-node-cli"
  exit 1
fi

echo "==> Ensuring raw chain spec exists"
mkdir -p config/chain-specs
if [ ! -f "config/chain-specs/local-raw.json" ]; then
  ./target/release/myl1-node build-spec --chain local --raw > config/chain-specs/local-raw.json
fi

echo "==> Checking zombienet"
if ! command -v "$ZOMBIENET_BIN" >/dev/null 2>&1; then
  echo "zombienet not found in PATH."
  echo "Install one of these ways:"
  echo "  - Download binary: https://github.com/paritytech/zombienet/releases"
  echo "  - Or set ZOMBIENET_BIN=/absolute/path/to/zombienet"
  exit 1
fi

echo "==> Spawning 5-validator local testnet via zombienet"
mkdir -p "$ZOMBIENET_DIR"

# Ensure `myl1-node` is found by zombienet as a command
export PATH="$ROOT_DIR/target/release:$PATH"

"$ZOMBIENET_BIN" spawn \
  --provider "$ZOMBIENET_PROVIDER" \
  --dir "$ZOMBIENET_DIR" \
  zombienet/myl1-local-5-validators.toml


