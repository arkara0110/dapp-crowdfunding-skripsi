// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const contract = await Crowdfunding.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Crowdfunding deployed to:", address);

  // PASTIKAN PANGGILAN FUNGSI INI MEMILIKI 4 ARGUMEN
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + 86400 * 365; // Set deadline 1 TAHUN dari sekarang

  const tx = await contract.createCampaign(
    "Bantu Renovasi Panti Asuhan", // Argumen 1: _title
    "Panti Asuhan Harapan Mulia membutuhkan bantuan untuk merenovasi atap gedung yang sudah mulai rapuh. Bantuan sekecil apapun sangat berarti bagi kami.", // Argumen 2: _description
    hre.ethers.parseEther("5"), // Argumen 3: _target
    deadline // Argumen 4: _deadline
  );

  await tx.wait();
  console.log(
    "✅ Dummy campaign 'Bantu Renovasi Panti Asuhan' berhasil dibuat."
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
