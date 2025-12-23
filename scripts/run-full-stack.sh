#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/infra/full-stack"

echo "==> Full stack (monitoring + explorer + wallet + indexer)"
echo ""
echo "Prerequisite: run node on host first:"
echo "  cargo build --release --package myl1-node-cli"
echo "  ./target/release/myl1-node --dev --prometheus-external --prometheus-port 9615"
echo ""
echo "Then run this:"
echo "  docker compose up -d"
echo ""
echo "Explorer:   http://127.0.0.1:3000"
echo "Wallet:     http://127.0.0.1:3001"
echo "Prometheus: http://127.0.0.1:9090"
echo "Grafana:    http://127.0.0.1:3002 (admin/admin)"
echo "Indexing:   http://127.0.0.1:4350/graphql"
echo ""

docker compose up -d


