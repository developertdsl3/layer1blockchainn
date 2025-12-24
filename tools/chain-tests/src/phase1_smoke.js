const fs = require("fs");
const path = require("path");
const { connect, getDevKeypair, signAndSendAndWaitFinalized, waitForBlocks } = require("./common");

async function main() {
  const { api, wsEndpoint } = await connect();
  const outDir = path.join(__dirname, "..", "out");
  fs.mkdirSync(outDir, { recursive: true });

  const chain = (await api.rpc.system.chain()).toString();
  const nodeName = (await api.rpc.system.name()).toString();
  const nodeVersion = (await api.rpc.system.version()).toString();

  const alice = await getDevKeypair("Alice");
  const bob = await getDevKeypair("Bob");

  // Block production check
  const blocks = await waitForBlocks(api, 3);

  // Fee + balances flow check: transfer and observe events
  const beforeAlice = (await api.query.system.account(alice.address)).data.free.toBigInt();
  const beforeBob = (await api.query.system.account(bob.address)).data.free.toBigInt();

  const amount = 1_000_000_000_000n; // 0.000001 in 18 decimals, safe small
  const tx = api.tx.balances.transferKeepAlive(bob.address, amount.toString());
  const res = await signAndSendAndWaitFinalized(api, tx, alice);

  const afterAlice = (await api.query.system.account(alice.address)).data.free.toBigInt();
  const afterBob = (await api.query.system.account(bob.address)).data.free.toBigInt();

  const report = {
    phase: "phase1",
    wsEndpoint,
    chain,
    node: { name: nodeName, version: nodeVersion },
    blocks,
    transfer: {
      from: alice.address,
      to: bob.address,
      amount: amount.toString(),
      finalizedHash: res.finalizedHash,
      events: res.events,
      balances: {
        before: { alice: beforeAlice.toString(), bob: beforeBob.toString() },
        after: { alice: afterAlice.toString(), bob: afterBob.toString() },
      },
    },
    palletsPresent: {
      babe: !!api.tx.babe,
      grandpa: !!api.tx.grandpa,
      staking: !!api.tx.staking,
      democracy: !!api.tx.democracy,
      council: !!api.tx.council || !!api.tx.collective,
      transactionPayment: !!api.query.transactionPayment,
      contracts: !!api.tx.contracts,
      revive: !!api.tx.revive,
    },
  };

  fs.writeFileSync(path.join(outDir, "phase1_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  await api.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


