# Faucet Restart Required

The faucet code has been updated to use Alice's account (with `//Alice` derivation) instead of the root account.

## What Changed

- The mnemonic "bottom drive obey lake curtain smoke basket hold race lonely fit walk" produces the root account (0 balance)
- Alice's account is derived from the same mnemonic with `//Alice` path
- The code now automatically detects the dev phrase and uses `//Alice` derivation

## Restart the Faucet

```bash
# Stop the current faucet (Ctrl+C if running in terminal)
# Then restart:
./scripts/start-faucet.sh
```

Or manually:
```bash
cd infra/faucet
npm start
```

## After Restart

1. Check the faucet status:
   ```bash
   curl http://localhost:3003/api/status
   ```

2. You should see:
   - Address: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` (Alice)
   - Balance: > 0 MYL1
   - Available: true

3. Open http://localhost:3003 and the faucet should be available!

