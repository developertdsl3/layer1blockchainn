#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REPORT_DIR="${REPORT_DIR:-./reports}"
mkdir -p "$REPORT_DIR"

ts="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT_JSON="$REPORT_DIR/all-phases-$ts.json"
REPORT_MD="$REPORT_DIR/all-phases-$ts.md"

echo "==> Building node"
cargo build --release --package myl1-node-cli

echo "==> Starting node (background)"
./target/release/myl1-node --dev --ws-port 9944 --rpc-port 9933 --prometheus-external --prometheus-port 9615 > "$REPORT_DIR/myl1-node-$ts.log" 2>&1 &
NODE_PID=$!

cleanup() {
  kill "$NODE_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Waiting for WS 9944..."
for i in $(seq 1 60); do
  if (echo > /dev/tcp/127.0.0.1/9944) >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Phase 1 (real chain smoke)"
(cd tools/chain-tests && npm install && npm run phase1) | tee "$REPORT_DIR/phase1-$ts.jsonl" >/dev/null || true

echo "==> Phase 2 (governance + staking)"
./scripts/test-phase2.sh || true

echo "==> Phase 3 (contracts)"
./scripts/test-phase3.sh || true

echo "==> Phase 4 (monitoring + indexing)"
chmod +x ./scripts/test-phase4.sh
./scripts/test-phase4.sh || true

echo "==> Collecting artifacts"
phase1_report="tools/chain-tests/out/phase1_report.json"
phase2_report="tools/chain-tests/out/REPORT.json"
evm_report="contracts/evm-hardhat/out/evm_deploy_report.json"

cat > "$REPORT_JSON" <<EOF
{
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeLog": "$REPORT_DIR/myl1-node-$ts.log",
  "phase1": $(test -f "$phase1_report" && cat "$phase1_report" || echo null),
  "phase2": $(test -f "$phase2_report" && cat "$phase2_report" || echo null),
  "phase3": { "evm": $(test -f "$evm_report" && cat "$evm_report" || echo null) },
  "phase4": { "graphqlSample": "$(test -f /tmp/myl1-phase4-graphql.json && cat /tmp/myl1-phase4-graphql.json | tr -d '\n' | tr -d '\r' | sed 's/\"/\\\\\"/g' || echo "")" }
}
EOF

cat > "$REPORT_MD" <<EOF
# MyL1 All-Phases Local Verification Report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Artifacts
- JSON: \`$REPORT_JSON\`
- Node log: \`$REPORT_DIR/myl1-node-$ts.log\`

## Phase 1
- Report: \`$phase1_report\`

## Phase 2
- Report: \`$phase2_report\`

## Phase 3
- EVM report: \`$evm_report\`
- Ink! build: run \`cargo-contract\` (see \`contracts/ink-flipper/README.md\`)

## Phase 4
- Prometheus: \`http://127.0.0.1:9090\`
- Grafana: \`http://127.0.0.1:3000\` (admin/admin) (from monitoring stack)
- Indexer GraphQL: \`http://127.0.0.1:4350/graphql\`

EOF

echo "✅ Done"
echo "Report:"
echo "  $REPORT_MD"
echo "  $REPORT_JSON"


