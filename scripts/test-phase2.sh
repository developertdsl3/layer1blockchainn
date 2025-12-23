#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Phase 2 tests (governance + staking snapshots)"
echo "This expects a running node at WS_ENDPOINT (default ws://127.0.0.1:9944)."
echo ""

if [ ! -d "tools/chain-tests" ]; then
  echo "Missing tools/chain-tests directory."
  exit 1
fi

pushd tools/chain-tests >/dev/null
npm install
npm run phase2:staking
npm run phase2:governance
npm run report
popd >/dev/null

echo ""
echo "Done. Reports:"
echo "  tools/chain-tests/out/REPORT.md"
echo "  tools/chain-tests/out/REPORT.json"


