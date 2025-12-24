#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Phase 3 tests: Ink! build + EVM deploy via eth-rpc sidecar"

echo ""
echo "==> 1) Build node (release)"
cargo build --release --package myl1-node-cli

echo ""
echo "==> 2) Start node (background)"
./target/release/myl1-node --dev --ws-port 9944 --rpc-port 9933 > /tmp/myl1-node.log 2>&1 &
NODE_PID=$!
echo "Node PID: $NODE_PID (log: /tmp/myl1-node.log)"

cleanup() {
  kill "$NODE_PID" >/dev/null 2>&1 || true
  kill "$ETH_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Waiting for WS 9944..."
for i in $(seq 1 60); do
  if (echo > /dev/tcp/127.0.0.1/9944) >/dev/null 2>&1; then break; fi
  sleep 1
done

echo ""
echo "==> 3) Build eth-rpc sidecar (release) and start (background)"
cargo build --release -p pallet-revive-eth-rpc --bin eth-rpc
./target/release/eth-rpc --dev --node-rpc-url ws://127.0.0.1:9944 --rpc-port 8545 > /tmp/myl1-eth-rpc.log 2>&1 &
ETH_PID=$!
echo "eth-rpc PID: $ETH_PID (log: /tmp/myl1-eth-rpc.log)"

echo "Waiting for HTTP 8545..."
for i in $(seq 1 60); do
  if (echo > /dev/tcp/127.0.0.1/8545) >/dev/null 2>&1; then break; fi
  sleep 1
done

echo ""
echo "==> 4) Ink! (compile only)"
if command -v cargo-contract >/dev/null 2>&1; then
  (cd contracts/ink-flipper && cargo contract build)
else
  echo "cargo-contract not installed; skipping Ink! build. Install with:"
  echo "  cargo install cargo-contract --force --locked"
fi

echo ""
echo "==> 5) EVM (Hardhat deploy)"
(cd contracts/evm-hardhat && npm install && EVM_RPC_URL=http://127.0.0.1:8545 npx hardhat run --network myl1 scripts/deploy.js)

echo ""
echo "✅ Phase 3 automation complete"
echo "EVM report: contracts/evm-hardhat/out/evm_deploy_report.json"


