# Phase 5 – QA Checklist (Before Mainnet / Audit)

## Build & determinism

- [ ] `cargo build --release --package myl1-node-cli` succeeds on a clean machine
- [ ] `rust-toolchain.toml` pinned and documented
- [ ] `Cargo.lock` committed and stable

## Runtime

- [ ] Runtime unit tests pass (`cargo test -p myl1-runtime`)
- [ ] `try-runtime` upgrade simulation documented and executed for a sample upgrade
- [ ] Weights reviewed / benchmarking notes captured

## Consensus / networking

- [ ] Block production stable over 24h
- [ ] Finality stable over 24h
- [ ] Peer count stable, no frequent disconnects

## Staking

- [ ] Validator onboarding documented
- [ ] Bond / nominate / validate flows verified
- [ ] Rewards payout verified
- [ ] Slashing params documented and tested in a controlled environment

## Governance

- [ ] Proposal lifecycle tested end-to-end
- [ ] Upgrade path tested via governance (runtime upgrade)

## Fees / gas model

- [ ] Fee estimation verified
- [ ] Fee collection flow verified
- [ ] Any fee swaps (if enabled) verified

## Smart contracts

- [ ] Ink! deploy/call verified
- [ ] EVM deploy/call verified
- [ ] Gas benchmarks captured on target hardware

## Infrastructure

- [ ] Public RPC behind rate limiting / WAF
- [ ] Prometheus/Grafana dashboards running
- [ ] Backups/snapshots automated and tested restore
- [ ] Explorer indexing stable (if using Subsquid)


