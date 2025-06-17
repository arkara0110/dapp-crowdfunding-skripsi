// scripts/interact.js
const hre = require("hardhat");

async function main() {
  // GANTI DENGAN ALAMAT KONTRAK ANDA SETELAH DEPLOY
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Dapatkan akun-akun dari Hardhat
  const [owner, donor1] = await hre.ethers.getSigners();

  // Hubungkan ke kontrak yang sudah ada
  const crowdfunding = await hre.ethers.getContractAt(
    "Crowdfunding",
    CONTRACT_ADDRESS
  );

  console.log(
    `Terhubung ke kontrak di alamat: ${await crowdfunding.getAddress()}`
  );
  console.log("============================================\n");

  // 1. MEMBACA SEMUA KAMPANYE
  console.log("Membaca semua kampanye yang ada...");
  const campaigns = await crowdfunding.getAllCampaigns();
  console.log(`Ditemukan ${campaigns.length} kampanye.`);
  // Tampilkan detail kampanye pertama
  if (campaigns.length > 0) {
    console.log("Detail Kampanye #1:", {
      title: campaigns[0].title,
      target: hre.ethers.formatEther(campaigns[0].target),
      amountCollected: hre.ethers.formatEther(campaigns[0].amountCollected),
      active: campaigns[0].active,
    });
  }
  console.log("\n============================================");

  // 2. MELAKUKAN DONASI
  const campaignId = 1; // Donasi ke kampanye pertama
  const donationAmount = hre.ethers.parseEther("0.5"); // Donasi sebesar 0.5 ETH
  console.log(
    `\nAkun ${
      donor1.address
    } akan berdonasi ke kampanye #${campaignId} sebesar ${hre.ethers.formatEther(
      donationAmount
    )} ETH...`
  );

  // Lakukan donasi dari akun 'donor1'
  const tx = await crowdfunding
    .connect(donor1)
    .donateToCampaign(campaignId, { value: donationAmount });

  await tx.wait();
  console.log("✅ Donasi berhasil!\n");
  console.log("============================================");

  // 3. MEMBACA DETAIL KAMPANYE LAGI SETELAH DONASI
  console.log(`\nMembaca kembali detail kampanye #${campaignId}...`);
  const campaignDetails = await crowdfunding.getCampaignDetails(campaignId);

  console.log("Detail Kampanye #1 Terbaru:", {
    title: campaignDetails.title,
    target: hre.ethers.formatEther(campaignDetails.target),
    amountCollected: hre.ethers.formatEther(campaignDetails.amountCollected),
    active: campaignDetails.active,
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
