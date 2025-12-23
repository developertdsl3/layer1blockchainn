const fs = require("fs");
const path = require("path");

function readIfExists(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const outDir = path.join(__dirname, "..", "out");
  const phase1 = readIfExists(path.join(outDir, "phase1_report.json"));
  const gov = readIfExists(path.join(outDir, "phase2_governance_report.json"));
  const staking = readIfExists(path.join(outDir, "phase2_staking_report.json"));

  const report = {
    generatedAt: new Date().toISOString(),
    reports: { phase1, phase2: { governance: gov, staking } },
  };

  const md = [];
  md.push(`# MyL1 Test Report`);
  md.push(`Generated: ${report.generatedAt}`);
  md.push(``);

  if (phase1) {
    md.push(`## Phase 1`);
    md.push(`- WS: \`${phase1.wsEndpoint}\``);
    md.push(`- Chain: **${phase1.chain}**`);
    md.push(`- Block production: ${phase1.blocks.start} → ${phase1.blocks.end}`);
    md.push(`- Transfer finalized: \`${phase1.transfer.finalizedHash}\``);
    md.push(``);
  }

  if (gov) {
    md.push(`## Phase 2 – Governance smoke`);
    md.push(`- Proposal hash: \`${gov.proposal.hash}\``);
    md.push(`- notePreimage finalized: \`${gov.notePreimage.finalizedHash}\``);
    md.push(`- propose finalized: \`${gov.propose.finalizedHash}\``);
    md.push(``);
  }

  if (staking) {
    md.push(`## Phase 2 – Staking snapshot`);
    md.push(`- activeEra: ${staking.staking.activeEra}`);
    md.push(`- validatorCount: ${staking.staking.validatorCount}`);
    md.push(`- minimumValidatorCount: ${staking.staking.minimumValidatorCount}`);
    md.push(``);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "REPORT.md"), md.join("\n"));
  fs.writeFileSync(path.join(outDir, "REPORT.json"), JSON.stringify(report, null, 2));
  console.log(`Wrote ${path.join(outDir, "REPORT.md")}`);
}

main();


