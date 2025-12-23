const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const outDir = path.join(__dirname, "..", "out");
  fs.mkdirSync(outDir, { recursive: true });

  console.log("Deployer:", deployer.address);
  console.log("Balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("hello-myl1");
  await greeter.waitForDeployment();

  const addr = await greeter.getAddress();
  console.log("Greeter deployed:", addr);

  const greeting1 = await greeter.greeting();
  console.log("Greeting:", greeting1);

  const tx = await greeter.setGreeting("hello-myl1-updated");
  const receipt = await tx.wait();
  console.log("setGreeting tx:", receipt.hash);

  const greeting2 = await greeter.greeting();
  console.log("Greeting:", greeting2);

  const result = {
    network: hre.network.name,
    deployer: deployer.address,
    contract: { name: "Greeter", address: addr },
    txs: { setGreeting: receipt.hash },
    greeting: { before: greeting1, after: greeting2 },
  };

  fs.writeFileSync(path.join(outDir, "evm_deploy_report.json"), JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


