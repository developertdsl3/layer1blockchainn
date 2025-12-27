#!/usr/bin/env node

/**
 * Test Transaction Script
 * Sends a test balance transfer transaction to verify explorer functionality
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const WS_ENDPOINT = process.env.WS_ENDPOINT || 'ws://127.0.0.1:9933';

// Alice's well-known account (pre-funded in devnet)
const ALICE_MNEMONIC = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';
const ALICE_ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

// Bob's well-known account
const BOB_ADDRESS = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

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
  const alice = keyring.addFromMnemonic(ALICE_MNEMONIC, { name: 'Alice' });

  console.log('📋 Account Information:');
  console.log(`   From: ${alice.address} (Alice)`);
  console.log(`   To:   ${BOB_ADDRESS} (Bob)\n`);

  // Get balances before
  console.log('💰 Checking balances before transaction...');
  const [aliceBalanceBefore, bobBalanceBefore] = await Promise.all([
    api.query.system.account(alice.address),
    api.query.system.account(BOB_ADDRESS)
  ]);

  const aliceFreeBefore = aliceBalanceBefore.data.free.toBigInt();
  const bobFreeBefore = bobBalanceBefore.data.free.toBigInt();

  console.log(`   Alice: ${(aliceFreeBefore / BigInt(10 ** 18)).toString()} MYL1`);
  console.log(`   Bob:   ${(bobFreeBefore / BigInt(10 ** 18)).toString()} MYL1\n`);

  // Prepare transaction
  const transferAmount = BigInt(1 * 10 ** 18); // 1 MYL1
  console.log(`📤 Preparing transfer: 1 MYL1 from Alice to Bob...`);

  const transfer = api.tx.balances.transferAllowDeath(
    BOB_ADDRESS,
    transferAmount.toString()
  );

  // Get transaction fee estimate
  const { partialFee } = await transfer.paymentInfo(alice.address);
  console.log(`   Estimated fee: ${(partialFee.toBigInt() / BigInt(10 ** 18)).toString()} MYL1\n`);

  // Send transaction
  console.log('⏳ Sending transaction...');
  const txHash = await new Promise((resolve, reject) => {
    transfer.signAndSend(alice, ({ status, events, dispatchError }) => {
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
  const [aliceBalanceAfter, bobBalanceAfter] = await Promise.all([
    api.query.system.account(alice.address),
    api.query.system.account(BOB_ADDRESS)
  ]);

  const aliceFreeAfter = aliceBalanceAfter.data.free.toBigInt();
  const bobFreeAfter = bobBalanceAfter.data.free.toBigInt();

  console.log(`   Alice: ${(aliceFreeAfter / BigInt(10 ** 18)).toString()} MYL1 (${aliceFreeBefore > aliceFreeAfter ? '-' : '+'}${((aliceFreeBefore - aliceFreeAfter) / BigInt(10 ** 18)).toString()})`);
  console.log(`   Bob:   ${(bobFreeAfter / BigInt(10 ** 18)).toString()} MYL1 (${bobFreeBefore < bobFreeAfter ? '+' : ''}${((bobFreeAfter - bobFreeBefore) / BigInt(10 ** 18)).toString()})\n`);

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


