require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { makePool, ensureSchema } = require("./db");

async function main() {
  const schemaPath = path.join(__dirname, "..", "schema.graphql");
  const typeDefs = fs.readFileSync(schemaPath, "utf8");

  const pool = makePool();
  await ensureSchema(pool);

  const resolvers = {
    Query: {
      transfers: async (_, { limit = 50, offset = 0 }) => {
        const res = await pool.query(
          `SELECT id, block_number, extrinsic_hash, from_account, to_account, amount
           FROM transfers
           ORDER BY block_number DESC, id DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        return res.rows.map((r) => ({
          id: r.id,
          blockNumber: r.block_number,
          extrinsicHash: r.extrinsic_hash,
          from: r.from_account,
          to: r.to_account,
          amount: r.amount,
        }));
      },
      transferCount: async () => {
        const res = await pool.query(`SELECT COUNT(*)::int AS c FROM transfers`);
        return res.rows[0].c;
      },
    },
  };

  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const port = parseInt(process.env.PORT || "4350", 10);
  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  app.listen(port, () => {
    console.log(`[graphql] listening on http://0.0.0.0:${port}/graphql`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


