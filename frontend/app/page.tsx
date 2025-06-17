"use client";

// Impor hooks dan utilitas yang dibutuhkan
import { useReadContract, usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { formatEther } from "viem";

// Impor komponen dan konstanta kustom
import { CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from "@/constants";
import { CampaignCard } from "./components/CampaignCard";

// Definisikan tipe data untuk struktur data dari smart contract
type Campaign = {
  id: bigint;
  title: string;
  description: string;
  target: bigint;
  deadline: bigint;
  amountCollected: bigint;
  active: boolean;
  donationsCount: bigint;
};

type Withdrawal = {
  campaignId: bigint;
  owner: `0x${string}`;
  amount: bigint;
};

// Fungsi helper untuk memotong alamat wallet
const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Home() {
  // Hook untuk mengambil data semua kampanye
  const {
    data: campaigns,
    isLoading,
    isError,
  } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "getAllCampaigns",
  });

  // Dapatkan publicClient untuk mengambil log event dari blockchain
  const publicClient = usePublicClient();
  // State untuk menyimpan semua riwayat penarikan dana
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);

  // useEffect untuk mengambil SEMUA log penarikan dana saat halaman dimuat
  useEffect(() => {
    const fetchAllWithdrawalLogs = async () => {
      if (!publicClient) return;
      try {
        const withdrawalLogs = await publicClient.getLogs({
          address: CROWDFUNDING_CONTRACT_ADDRESS,
          event: {
            type: "event",
            name: "FundsWithdrawn",
            inputs: [
              { type: "uint256", name: "campaignId", indexed: true },
              { type: "address", name: "owner", indexed: true },
              { type: "uint256", name: "amount" },
            ],
          },
          fromBlock: 0n, // Cari dari blok pertama
          toBlock: "latest",
        });

        const formattedWithdrawals = withdrawalLogs.map((log) => ({
          campaignId: log.args.campaignId!,
          owner: log.args.owner!,
          amount: log.args.amount!,
        }));

        // Tampilkan yang terbaru (transaksi terakhir) di paling atas
        setAllWithdrawals(formattedWithdrawals.reverse());
      } catch (err) {
        console.error("Gagal mengambil log penarikan dana global:", err);
      }
    };

    fetchAllWithdrawalLogs();
  }, [publicClient]); // Dijalankan saat publicClient siap

  // Logika untuk memisahkan kampanye menjadi aktif dan tidak aktif
  const nowInSeconds = BigInt(Math.floor(Date.now() / 1000));

  const activeCampaigns = campaigns
    ? (campaigns as Campaign[]).filter(
        (c) => c.active && c.deadline > nowInSeconds
      )
    : [];

  const inactiveCampaigns = campaigns
    ? (campaigns as Campaign[]).filter(
        (c) => !c.active || c.deadline <= nowInSeconds
      )
    : [];

  return (
    <main className="p-4 md:p-8">
      {/* Bagian Hero Section */}
      <section className="text-center py-16 sm:py-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
          Bantu Wujudkan <span className="text-cyan-400">Harapan Mulia</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400">
          Setiap donasi Anda memberikan cahaya baru bagi mereka yang
          membutuhkan. Bersama, kita ciptakan perubahan yang berarti.
        </p>
      </section>

      {/* Bagian untuk Kampanye Aktif */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          Kampanye Aktif
        </h2>
        {isLoading && (
          <p className="text-center text-gray-400">Memuat kampanye...</p>
        )}
        {isError && (
          <p className="text-center text-red-500">
            Gagal memuat data kampanye.
          </p>
        )}
        {!isLoading && activeCampaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id.toString()} campaign={campaign} />
            ))}
          </div>
        )}
        {!isLoading && activeCampaigns.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Saat ini tidak ada kampanye yang sedang aktif.
          </p>
        )}
      </section>

      {/* Bagian untuk Riwayat Kampanye */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          Riwayat Kampanye
        </h2>
        {!isLoading && inactiveCampaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id.toString()} campaign={campaign} />
            ))}
          </div>
        )}
        {!isLoading && inactiveCampaigns.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Belum ada riwayat kampanye.
          </p>
        )}
      </section>

      {/* Bagian Baru: Riwayat Penarikan Dana Global */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          Aktivitas Penarikan Dana
        </h2>
        <div className="bg-slate-800/50 p-6 rounded-lg border border-white/10">
          {allWithdrawals.length > 0 ? (
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-3">
              {allWithdrawals.map((withdrawal, index) => (
                <div
                  key={index}
                  className="flex flex-wrap justify-between items-center bg-yellow-900/30 p-3 rounded-md text-sm gap-2"
                >
                  <p className="text-yellow-400">
                    Admin{" "}
                    <span className="font-mono text-white">
                      {truncateAddress(withdrawal.owner)}
                    </span>{" "}
                    menarik dana dari{" "}
                    <span className="font-semibold text-white">
                      Kampanye #{withdrawal.campaignId.toString()}
                    </span>
                  </p>
                  <p className="font-bold text-lg text-white">
                    {formatEther(withdrawal.amount)} ETH
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">
              Belum ada aktivitas penarikan dana.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
