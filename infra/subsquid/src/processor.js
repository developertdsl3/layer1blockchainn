require("dotenv").config();

const { ApiPromise, WsProvider } = require("@polkadot/api");
const { makePool, ensureSchema } = require("./db");

async function main() {
  const ws = process.env.WS_ENDPOINT || "ws://host.docker.internal:9944";
  const provider = new WsProvider(ws);
  const api = await ApiPromise.create({ provider });

  const pool = makePool();
  await ensureSchema(pool);

  console.log(`[processor] connected: ${ws}`);

  let counter = 0;

  const unsub = await api.rpc.chain.subscribeFinalizedHeads(async (header) => {
    const blockHash = header.hash.toHex();
    const blockNumber = header.number.toNumber();
    const signedBlock = await api.rpc.chain.getBlock(blockHash);
    const events = await api.query.system.events.at(blockHash);

    // Map extrinsic index -> hash
    const extrinsicHashes = signedBlock.block.extrinsics.map((ex) => ex.hash.toHex());

    for (let idx = 0; idx < events.length; idx++) {
      const { event, phase } = events[idx];
      if (event.section === "balances" && event.method === "Transfer") {
        const [from, to, amount] = event.data;
        const exIndex = phase.isApplyExtrinsic ? phase.asApplyExtrinsic.toNumber() : null;
        const extrinsicHash = exIndex !== null ? extrinsicHashes[exIndex] : null;

        const id = `${blockNumber}-${idx}`;
        await pool.query(
          `INSERT INTO transfers (id, block_number, extrinsic_hash, from_account, to_account, amount)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (id) DO NOTHING`,
          [id, blockNumber, extrinsicHash, from.toString(), to.toString(), amount.toString()]
        );
        counter++;
      }
    }

    if (counter > 0) {
      console.log(`[processor] finalized #${blockNumber} (${counter} transfers indexed so far)`);
    }
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    try {
      await api.disconnect();
      await pool.end();
    } finally {
      unsub();
      process.exit(0);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


