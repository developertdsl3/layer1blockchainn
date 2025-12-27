#!/usr/bin/env node

/**
 * Test Transaction Script
 * Sends a test balance transfer transaction to verify explorer functionality
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const WS_ENDPOINT = process.env.WS_ENDPOINT || 'ws://127.0.0.1:9933';

// Bob's well-known account (has funds)
const BOB_MNEMONIC = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Bob';
const BOB_ADDRESS = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

// Alice's address (recipient - well-known address)
const ALICE_ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

async function main() {
  console.log('🚀 Starting Transaction Test...\n');

  // Wait for crypto to be ready
  await cryptoWaitReady();

  // Initialize API
  console.log(`📡 Connecting to node at ${WS_ENDPOINT}...`);
  const provider = new WsProvider(WS_ENDPOINT);
  const api = await ApiPromise.create({ provider });
  await api.isReady;
  console.log('✅ Connected to node\n');

  // Setup keyring
  const keyring = new Keyring({ type: 'sr25519' });
  const bob = keyring.addFromUri(BOB_MNEMONIC, { name: 'Bob' });

  console.log('📋 Account Information:');
  console.log(`   From: ${bob.address} (Bob)`);
  console.log(`   To:   ${ALICE_ADDRESS} (Alice)\n`);

  // Get balances before
  console.log('💰 Checking balances before transaction...');
  const [bobBalanceBefore, aliceBalanceBefore] = await Promise.all([
    api.query.system.account(bob.address),
    api.query.system.account(ALICE_ADDRESS)
  ]);

  const bobFreeBefore = bobBalanceBefore.data.free.toBigInt();
  const aliceFreeBefore = aliceBalanceBefore.data.free.toBigInt();

  console.log(`   Bob:   ${(bobFreeBefore / BigInt(10 ** 18)).toString()} MYL1`);
  console.log(`   Alice: ${(aliceFreeBefore / BigInt(10 ** 18)).toString()} MYL1\n`);

  // Prepare transaction
  const transferAmount = BigInt(1 * 10 ** 18); // 1 MYL1
  console.log(`📤 Preparing transfer: 1 MYL1 from Bob to Alice...`);

  const transfer = api.tx.balances.transferAllowDeath(
    ALICE_ADDRESS,
    transferAmount.toString()
  );

  // Get transaction fee estimate
  const { partialFee } = await transfer.paymentInfo(bob.address);
  console.log(`   Estimated fee: ${(partialFee.toBigInt() / BigInt(10 ** 18)).toString()} MYL1\n`);

  // Send transaction
  console.log('⏳ Sending transaction...');
  const txHash = await new Promise((resolve, reject) => {
    transfer.signAndSend(bob, ({ status, events, dispatchError }) => {
      if (dispatchError) {
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          reject(new Error(`${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`));
        } else {
          reject(new Error(dispatchError.toString()));
        }
        return;
      }

      if (status.isInBlock || status.isFinalized) {
        const blockHash = status.asInBlock || status.asFinalized;
        console.log(`   ✅ Transaction included in block: ${blockHash.toString()}`);
        
        // Show events
        events.forEach(({ event }) => {
          if (event.section === 'balances' && event.method === 'Transfer') {
            const [from, to, amount] = event.data;
            console.log(`   📊 Event: ${event.section}.${event.method}`);
            console.log(`      From: ${from.toString()}`);
            console.log(`      To:   ${to.toString()}`);
            console.log(`      Amount: ${(amount.toBigInt() / BigInt(10 ** 18)).toString()} MYL1`);
          }
        });

        resolve(blockHash.toString());
      }
    });
  });

  console.log(`\n✅ Transaction successful!`);
  console.log(`   Transaction Hash: ${txHash}\n`);

  // Wait a bit for block to finalize
  console.log('⏳ Waiting for block finalization...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get balances after
  console.log('💰 Checking balances after transaction...');
  const [bobBalanceAfter, aliceBalanceAfter] = await Promise.all([
    api.query.system.account(bob.address),
    api.query.system.account(ALICE_ADDRESS)
  ]);

  const bobFreeAfter = bobBalanceAfter.data.free.toBigInt();
  const aliceFreeAfter = aliceBalanceAfter.data.free.toBigInt();

  const bobChange = (bobFreeBefore - bobFreeAfter) / BigInt(10 ** 18);
  const aliceChange = (aliceFreeAfter - aliceFreeBefore) / BigInt(10 ** 18);

  console.log(`   Bob:   ${(bobFreeAfter / BigInt(10 ** 18)).toString()} MYL1 (${bobChange > 0 ? '-' : '+'}${bobChange.toString()})`);
  console.log(`   Alice: ${(aliceFreeAfter / BigInt(10 ** 18)).toString()} MYL1 (${aliceChange > 0 ? '+' : ''}${aliceChange.toString()})\n`);

  // Get block info
  const blockHash = await api.rpc.chain.getBlockHash();
  const header = await api.rpc.chain.getHeader(blockHash);
  console.log('📦 Latest Block Info:');
  console.log(`   Block Number: ${header.number.toNumber()}`);
  console.log(`   Block Hash: ${blockHash.toString()}\n`);

  console.log('🎉 Transaction test complete!');
  console.log('\n📊 Check your explorer at http://localhost:3000');
  console.log('   You should see:');
  console.log('   - The transaction in "Latest Transactions"');
  console.log('   - Updated TPS values');
  console.log('   - The block in "Latest Blocks"\n');

  await api.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
});

