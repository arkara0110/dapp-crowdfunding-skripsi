# Crowdfunding dApp untuk Skripsi

![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-black?style=for-the-badge&logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-^14.2.4-black?style=for-the-badge&logo=next.js)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22.6-yellow?style=for-the-badge&logo=hardhat)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-black?style=for-the-badge&logo=tailwind-css)
![Wagmi](https://img.shields.io/badge/Wagmi-2.9.10-blue?style=for-the-badge&logo=ethereum)

![Crowdfunding dApp](https://i.imgur.com/2b3b06.png) ## 💡 Deskripsi Proyek

**Crowdfunding dApp** adalah implementasi nyata sebuah platform penggalangan dana terdesentralisasi (dApp) yang dibangun di atas teknologi blockchain. Proyek ini dibuat untuk memenuhi syarat kelulusan dan mendemonstrasikan bagaimana teknologi Web3 dapat menciptakan sistem crowdfunding yang lebih transparan, efisien, dan tanpa perantara dibandingkan dengan platform Web2 tradisional.

Aplikasi ini memungkinkan sebuah yayasan (sebagai pemilik) untuk membuat kampanye penggalangan dana, dan memungkinkan siapa saja di seluruh dunia untuk berdonasi secara langsung menggunakan dompet kripto. Semua transaksi tercatat secara permanen dan dapat diaudit secara publik di blockchain.

---

## ✨ Fitur Utama

### Untuk Pengguna Umum / Donatur
- **Melihat Kampanye**: Melihat daftar kampanye yang sedang aktif dan riwayat kampanye yang telah berakhir.
- **Detail Kampanye**: Melihat informasi lengkap setiap kampanye, termasuk target, dana terkumpul, batas waktu dinamis, daftar donatur, dan riwayat penarikan dana.
- **Donasi Transparan**: Melakukan donasi langsung ke smart contract menggunakan dompet MetaMask dengan notifikasi yang modern.
- **Riwayat Donasi Pribadi**: Melihat riwayat semua donasi yang pernah dilakukan oleh pengguna di halaman khusus.

### Untuk Admin / Pemilik Yayasan
- **Akses Terproteksi**: Halaman admin hanya bisa diakses oleh alamat dompet yang men-deploy kontrak.
- **Membuat Kampanye**: Membuat kampanye penggalangan dana baru melalui antarmuka web.
- **Menarik Dana**: Menarik dana yang telah terkumpul dari sebuah kampanye langsung ke dompet pemilik.
- **Manajemen Status**: Melihat status setiap kampanye (Aktif, Nonaktif, Berakhir) di dashboard admin.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

### Backend (Smart Contract)
- **Bahasa**: Solidity ^0.8.20
- **Framework**: Hardhat
- **Standar Kontrak**: OpenZeppelin (`Ownable`, `ReentrancyGuard`)
- **Testing**: Chai & Ethers.js

### Frontend (dApp Interface)
- **Framework**: Next.js (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **Interaksi Blockchain**: wagmi & Viem
- **Koneksi Dompet**: RainbowKit
- **Notifikasi**: React Hot Toast

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

Pastikan Anda memiliki Node.js dan npm terinstal.

### 1. Kloning & Instalasi Awal
```bash
# 1. Kloning repositori ini
git clone [https://github.com/arkara0110/dapp-crowdfunding-skripsi.git](https://github.com/arkara0110/dapp-crowdfunding-skripsi.git)

# 2. Masuk ke direktori proyek
cd dapp-crowdfunding-skripsi

# 3. Instal dependensi backend
npm install

# 4. Masuk ke direktori frontend dan instal dependensinya
cd frontend
npm install
cd ..
2. Kompilasi Smart Contract
Bash

# Pastikan Anda berada di direktori root
npx hardhat compile
3. Menjalankan Proyek
Buka dua terminal di direktori root proyek.

Di Terminal 1 (Untuk Blockchain Lokal):

Bash

npx hardhat node
Biarkan terminal ini tetap berjalan.

Di Terminal 2 (Untuk Deploy & Frontend):

Bash

# 1. Deploy kontrak ke jaringan lokal
npx hardhat run scripts/deploy.js --network localhost

# 2. PENTING: Salin alamat kontrak yang muncul di terminal
# Contoh output: Crowdfunding deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

# 3. Perbarui Alamat Kontrak & ABI di Frontend:
#    - Buka file 'frontend/constants/index.ts'.
#    - Tempel alamat kontrak yang baru saja disalin ke variabel 'CROWDFUNDING_CONTRACT_ADDRESS'.
#    - Buka file 'artifacts/contracts/Crowdfunding.sol/Crowdfunding.json', salin SELURUH isi array di dalam kunci "abi", lalu tempel untuk menggantikan isi array 'CROWDFUNDING_ABI'. Ini sangat penting setiap kali Anda mengubah smart contract.

# 4. Jalankan aplikasi frontend
cd frontend
npm run dev
4. Konfigurasi MetaMask
Buka browser dan hubungkan MetaMask.
Tambahkan jaringan baru dengan konfigurasi:
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
Impor akun dari terminal Hardhat (gunakan private key yang ditampilkan). Sangat disarankan untuk mengimpor setidaknya dua akun:
Account #0 (untuk berperan sebagai Admin/Pemilik).
Account #1 (untuk berperan sebagai Donatur).
Aplikasi sekarang bisa diakses di http://localhost:3000.