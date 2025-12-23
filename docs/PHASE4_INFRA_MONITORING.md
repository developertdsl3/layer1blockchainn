# Phase 4 – Infrastructure & Monitoring (Local + Deploy-Ready)

## Monitoring (Prometheus + Grafana)

### 1) Run node with metrics enabled

Example:

```bash
./target/release/myl1-node --dev --prometheus-external --prometheus-port 9615
```

### 2) Start monitoring stack

```bash
./scripts/run-monitoring.sh
```

- Prometheus: `http://127.0.0.1:9090`
- Grafana: `http://127.0.0.1:3000` (admin/admin)

## RPC nodes (deployment guidance)

For public RPC nodes you typically run:

- 1–2 **RPC nodes** (non-validator) with public WS/HTTP
- N **validators** with private RPC (or firewall restricted)

Minimum flags to consider (security-sensitive):

- expose RPC only behind firewall / reverse proxy
- disable unsafe RPC methods
- enable rate limits at the proxy layer

## Snapshots / backups

Create a base-path snapshot:

```bash
./scripts/snapshot-node-data.sh /path/to/base-path ./snapshots
```

Automate via cron/systemd timers and store in offsite storage (S3/Backblaze/etc).


