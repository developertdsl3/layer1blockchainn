const fs = require("fs");
const path = require("path");
const { connect, getDevKeypair, signAndSendAndWaitFinalized } = require("./common");

async function main() {
  const { api, wsEndpoint } = await connect();
  const outDir = path.join(__dirname, "..", "out");
  fs.mkdirSync(outDir, { recursive: true });

  const alice = await getDevKeypair("Alice");

  if (!api.tx.democracy) {
    throw new Error("Democracy pallet not found in metadata (api.tx.democracy missing)");
  }

  // Create a minimal proposal: system.remark (stored as preimage) and then propose it.
  const remark = api.tx.system.remark(`myl1-governance-smoke-${Date.now()}`);

  // 1) note preimage
  const note = api.tx.democracy.notePreimage(remark.method.toHex());
  const noteRes = await signAndSendAndWaitFinalized(api, note, alice);

  // 2) propose (deposit must be enough; use a safe value)
  const proposalHash = remark.method.hash.toHex();
  const deposit = api.consts.democracy?.minimumDeposit
    ? api.consts.democracy.minimumDeposit
    : api.createType("Balance", 1_000_000_000_000_000n.toString());

  const propose = api.tx.democracy.propose(proposalHash, deposit);
  const proposeRes = await signAndSendAndWaitFinalized(api, propose, alice);

  const report = {
    phase: "phase2-governance",
    wsEndpoint,
    proposer: alice.address,
    proposal: {
      remark: remark.method.toHex(),
      hash: proposalHash,
      deposit: deposit.toString(),
    },
    notePreimage: noteRes,
    propose: proposeRes,
  };

  fs.writeFileSync(path.join(outDir, "phase2_governance_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  await api.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


