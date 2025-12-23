# Ink! Contract Demo (Flipper)

## Build

Requires `cargo-contract`.

```bash
cargo install cargo-contract --force --locked
```

Build the contract:

```bash
cd contracts/ink-flipper
cargo contract build
```

This produces:
- `.contract`
- metadata + wasm in `target/ink/`

## Deploy

Use Polkadot.js Apps:
- `https://polkadot.js.org/apps`
- Connect to `ws://127.0.0.1:9944`
- Developer → Contracts → Upload & Deploy


