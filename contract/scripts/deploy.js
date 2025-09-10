const { writeFileSync } = require("fs");
const { join } = require("path");

async function main() {
  const FarmMateLedger = await ethers.getContractFactory("FarmMateLedger");
  const ledger = await FarmMateLedger.deploy();
  await ledger.waitForDeployment();
  const address = await ledger.getAddress();
  console.log("FarmMateLedger deployed to:", address);

  // Write ABI and address to backend folder
  const artifact = await artifacts.readArtifact("FarmMateLedger");
  const backendDir = join(__dirname, "../../backend");
  writeFileSync(join(backendDir, "contract-address.json"), JSON.stringify({ FarmMateLedger: address }, null, 2));
  writeFileSync(join(backendDir, "contract-abi.json"), JSON.stringify(artifact.abi, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


