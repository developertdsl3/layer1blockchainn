# EVM Contract Demo (Hardhat)

This demo deploys a Solidity contract against the **pallet-revive Ethereum JSON-RPC** sidecar (`eth-rpc`).

## Run (local)

Start a node (in one terminal):

```bash
cargo build --release --package myl1-node-cli
./target/release/myl1-node --dev
```

Start the eth-rpc sidecar (in another terminal):

```bash
cargo run -p pallet-revive-eth-rpc --bin eth-rpc -- --dev --node-rpc-url ws://127.0.0.1:9944 --rpc-port 8545
```

Deploy:

```bash
cd contracts/evm-hardhat
npm install
EVM_RPC_URL=http://127.0.0.1:8545 npx hardhat run --network myl1 scripts/deploy.js
```

Output: `contracts/evm-hardhat/out/evm_deploy_report.json`


