#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/infra/subsquid"

echo "==> Starting Subsquid-style indexer (db + processor + graphql)"
echo "GraphQL: http://127.0.0.1:4350/graphql"
echo ""
echo "Note: run your node on host first, e.g.:"
echo "  ./target/release/myl1-node --dev"
echo ""

docker compose up -d


