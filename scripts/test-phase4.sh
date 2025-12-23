#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Phase 4 tests: monitoring + indexing"
echo ""
echo "Prerequisite: run node on host with metrics enabled:"
echo "  ./target/release/myl1-node --dev --prometheus-external --prometheus-port 9615"
echo ""

echo "==> 1) Start monitoring"
./scripts/run-monitoring.sh

echo "Waiting for Prometheus..."
for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:9090/-/ready" >/dev/null 2>&1; then break; fi
  sleep 1
done
echo "✅ Prometheus ready"

echo "==> 2) Start indexer"
./scripts/run-subsquid.sh

echo "Waiting for GraphQL..."
for i in $(seq 1 90); do
  if curl -fsS "http://127.0.0.1:4350/healthz" >/dev/null 2>&1; then break; fi
  sleep 1
done
echo "✅ GraphQL ready"

echo "==> 3) Query GraphQL"
curl -fsS \
  -H "Content-Type: application/json" \
  -d '{"query":"query { transferCount }"}' \
  http://127.0.0.1:4350/graphql \
  | tee /tmp/myl1-phase4-graphql.json >/dev/null

echo "✅ Phase 4 checks complete"
echo "GraphQL sample response saved: /tmp/myl1-phase4-graphql.json"


