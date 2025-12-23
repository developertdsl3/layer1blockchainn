const fs = require("fs");
const path = require("path");
const { connect } = require("./common");

async function main() {
  const { api, wsEndpoint } = await connect();
  const outDir = path.join(__dirname, "..", "out");
  fs.mkdirSync(outDir, { recursive: true });

  if (!api.query.staking) {
    throw new Error("Staking pallet not found in metadata (api.query.staking missing)");
  }

  // This script is intentionally non-destructive: it gathers staking config/state.
  // Full staking actions (bond/validate/nominate) depend on genesis and is chain-specific.
  const activeEra = await api.query.staking.activeEra();
  const validatorCount = await api.query.staking.validatorCount();
  const minimumValidatorCount = await api.query.staking.minimumValidatorCount();

  // Some networks expose these, some not; guard as optional
  const minNominatorBond = api.consts.staking?.minNominatorBond?.toString?.() ?? null;
  const minValidatorBond = api.consts.staking?.minValidatorBond?.toString?.() ?? null;

  const report = {
    phase: "phase2-staking",
    wsEndpoint,
    staking: {
      activeEra: activeEra.toString(),
      validatorCount: validatorCount.toString(),
      minimumValidatorCount: minimumValidatorCount.toString(),
      minNominatorBond,
      minValidatorBond,
    },
  };

  fs.writeFileSync(path.join(outDir, "phase2_staking_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  await api.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


