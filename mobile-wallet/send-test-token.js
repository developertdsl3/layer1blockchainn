#!/usr/bin/env node

/**
 * Send Test Token Script
 * Sends 1 MYL1 token to a specified address for wallet testing
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const WS_ENDPOINT = 'ws://13.211.114.206:9944';
const TARGET_ADDRESS = process.argv[2] || '5EkEtseWEvV1Kj4aqSVxiU8fBUxbj51aqWeEotH4khrSwSJk';

// Alice's well-known account (pre-funded in devnet)
const ALICE_MNEMONIC = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';

async function main() {
  console.log('🚀 Sending Test Token...\n');

  if (!TARGET_ADDRESS) {
    console.error('❌ Error: Please provide a target address');
    console.log('Usage: node send-test-token.js <address>');
    process.exit(1);
  }

  try {
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

    console.log('📋 Transaction Details:');
    console.log(`   From: ${alice.address} (Alice)`);
    console.log(`   To:   ${TARGET_ADDRESS}`);
    console.log(`   Amount: 1 MYL1\n`);

    // Check if target address is valid
    try {
      keyring.encodeAddress(TARGET_ADDRESS);
      console.log('✅ Target address is valid\n');
    } catch (error) {
      console.error('❌ Invalid target address format');
      await api.disconnect();
      process.exit(1);
    }

    // Get balances before
    console.log('💰 Checking balances before transaction...');
    const [aliceBalanceBefore, targetBalanceBefore] = await Promise.all([
      api.query.system.account(alice.address),
      api.query.system.account(TARGET_ADDRESS)
    ]);

    const aliceFreeBefore = aliceBalanceBefore.data.free.toBigInt();
    const targetFreeBefore = targetBalanceBefore.data.free.toBigInt();

    console.log(`   Alice: ${(aliceFreeBefore / BigInt(10 ** 12)).toString()} MYL1`);
    console.log(`   Target: ${(targetFreeBefore / BigInt(10 ** 12)).toString()} MYL1\n`);

    // Prepare transaction (1 MYL1 = 1 * 10^12 units with 12 decimals)
    const transferAmount = BigInt(1 * 10 ** 12); // 1 MYL1
    console.log(`📤 Preparing transfer: 1 MYL1 from Alice to target address...`);

    const transfer = api.tx.balances.transferAllowDeath(
      TARGET_ADDRESS,
      transferAmount.toString()
    );

    // Get transaction fee estimate
    const { partialFee } = await transfer.paymentInfo(alice.address);
    console.log(`   Estimated fee: ${(partialFee.toBigInt() / BigInt(10 ** 12)).toString()} MYL1\n`);

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

          // Show relevant events
          events.forEach(({ event }) => {
            if (event.section === 'balances' && event.method === 'Transfer') {
              const [from, to, amount] = event.data;
              console.log(`   📊 Transfer Event:`);
              console.log(`      From: ${from.toString()}`);
              console.log(`      To:   ${to.toString()}`);
              console.log(`      Amount: ${(amount.toBigInt() / BigInt(10 ** 12)).toString()} MYL1`);
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
    const [aliceBalanceAfter, targetBalanceAfter] = await Promise.all([
      api.query.system.account(alice.address),
      api.query.system.account(TARGET_ADDRESS)
    ]);

    const aliceFreeAfter = aliceBalanceAfter.data.free.toBigInt();
    const targetFreeAfter = targetBalanceAfter.data.free.toBigInt();

    console.log(`   Alice: ${(aliceFreeAfter / BigInt(10 ** 12)).toString()} MYL1 (${aliceFreeBefore > aliceFreeAfter ? '-' : '+'}${((aliceFreeBefore - aliceFreeAfter) / BigInt(10 ** 12)).toString()})`);
    console.log(`   Target: ${(targetFreeAfter / BigInt(10 ** 12)).toString()} MYL1 (${targetFreeBefore < targetFreeAfter ? '+' : ''}${((targetFreeAfter - targetFreeBefore) / BigInt(10 ** 12)).toString()})\n`);

    console.log('🎉 Test token sent successfully!');
    console.log(`\n📊 Check your wallet and explorer:`);
    console.log(`   Wallet should show +1 MYL1`);
    console.log(`   Explorer: http://13.211.114.206:3000`);
    console.log(`   Transaction: ${txHash}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (global.api) {
      await global.api.disconnect();
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down...');
  if (global.api) {
    await global.api.disconnect();
  }
  process.exit(0);
});

main();
