require("@nomicfoundation/hardhat-toolbox");

const EVM_RPC_URL = process.env.EVM_RPC_URL || "http://127.0.0.1:8545";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    myl1: {
      url: EVM_RPC_URL,
      // eth-rpc sidecar exposes a dev account when started with --dev.
      // If you want to use a specific key, set PRIVATE_KEY in env.
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
  },
};


