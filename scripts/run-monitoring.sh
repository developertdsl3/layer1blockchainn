#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/infra/monitoring"

echo "==> Starting Prometheus + Grafana"
echo "Prometheus: http://127.0.0.1:9090"
echo "Grafana:    http://127.0.0.1:3002  (admin/admin)"
docker compose up -d


