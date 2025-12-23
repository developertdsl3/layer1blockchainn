const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { cryptoWaitReady } = require("@polkadot/util-crypto");

function env(name, fallback = undefined) {
  const v = process.env[name];
  return v === undefined || v === "" ? fallback : v;
}

async function connect() {
  const wsEndpoint = env("WS_ENDPOINT", "ws://127.0.0.1:9944");
  const provider = new WsProvider(wsEndpoint);
  const api = await ApiPromise.create({ provider });
  return { api, wsEndpoint };
}

async function getDevKeypair(name) {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: "sr25519" });
  // Works for dev chains: //Alice, //Bob, etc.
  return keyring.addFromUri(`//${name}`);
}

async function signAndSendAndWaitFinalized(api, tx, signer) {
  return new Promise((resolve, reject) => {
    tx.signAndSend(signer, ({ status, dispatchError, events }) => {
      if (dispatchError) {
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          const { docs, name, section } = decoded;
          reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
        } else {
          reject(new Error(dispatchError.toString()));
        }
        return;
      }

      if (status.isFinalized) {
        resolve({
          finalizedHash: status.asFinalized.toString(),
          events: events.map((e) => ({
            section: e.event.section,
            method: e.event.method,
            data: e.event.data.toString(),
          })),
        });
      }
    }).catch(reject);
  });
}

async function waitForBlocks(api, count = 3) {
  const start = (await api.rpc.chain.getHeader()).number.toNumber();
  const target = start + count;
  // poll header
  while (true) {
    const now = (await api.rpc.chain.getHeader()).number.toNumber();
    if (now >= target) return { start, end: now };
    await new Promise((r) => setTimeout(r, 1500));
  }
}

module.exports = {
  connect,
  getDevKeypair,
  signAndSendAndWaitFinalized,
  waitForBlocks,
  env,
};


