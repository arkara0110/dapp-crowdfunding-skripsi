// scripts/deploy.js
const hre = require("hardhat");
// Impor 'time' helper dari Hardhat untuk memanipulasi waktu
const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  const [deployer, donatur1] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const contract = await Crowdfunding.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("Crowdfunding contract deployed to:", address);
  console.log("---");

  const now = Math.floor(Date.now() / 1000);

  // 1. Membuat kampanye yang AKAN BERAKHIR
  const shortDeadline = now + 3600; // Set 1 jam dari sekarang
  await contract.createCampaign(
    "Bantu Korban Banjir (Simulasi Berakhir)",
    "Penggalangan dana untuk membantu warga yang terdampak banjir bandang di wilayah Suka Makmur.",
    hre.ethers.parseEther("10"),
    shortDeadline
  );
  console.log("✅ Data Dummy 1: Kampanye 'Simulasi Berakhir' berhasil dibuat.");

  // MAJUKAN WAKTU BLOCKCHAIN SEBANYAK 2 HARI
  await time.increase(86400 * 2);
  console.log(
    "⏰ Waktu blockchain telah dimajukan 2 hari. Kampanye #1 sekarang sudah berakhir."
  );

  // 2. Membuat kampanye AKTIF untuk uji coba donasi
  const deadlineActive = (await time.latest()) + 86400 * 30; // 30 hari dari waktu TERBARU
  await contract.createCampaign(
    "Biaya Pendidikan Anak Panti",
    "Membantu menyediakan peralatan sekolah dan biaya pendidikan untuk anak-anak di Panti Asuhan Harapan Mulia.",
    hre.ethers.parseEther("5"),
    deadlineActive
  );
  console.log(
    "✅ Data Dummy 2: Kampanye 'Aktif untuk Donasi' berhasil dibuat."
  );

  // 3. Membuat kampanye AKTIF untuk uji coba penarikan dana (dan langsung didonasi)
  const deadlineWithdraw = (await time.latest()) + 86400 * 60; // 60 hari dari waktu TERBARU
  await contract.createCampaign(
    "Bantuan Medis untuk Lansia",
    "Menyediakan pemeriksaan kesehatan gratis dan bantuan obat-obatan untuk para lansia di desa terpencil.",
    hre.ethers.parseEther("8"),
    deadlineWithdraw
  );
  console.log(
    "✅ Data Dummy 3: Kampanye 'Aktif untuk Withdraw' berhasil dibuat."
  );

  // Langsung lakukan donasi ke kampanye ke-3 dari akun 'donatur1'
  await contract
    .connect(donatur1)
    .donateToCampaign(3, { value: hre.ethers.parseEther("1.5") });
  console.log("✅ Donasi awal ke Kampanye #3 sebesar 1.5 ETH berhasil.");
  console.log("---");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
