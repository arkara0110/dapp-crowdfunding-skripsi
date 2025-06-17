"use client";

// Impor hooks dan utilitas yang dibutuhkan dari library
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

// Impor komponen dan konstanta kustom
import { useCountdown } from "@/app/hooks/useCountdown";
import { CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from "@/constants";

// Tipe data untuk Donasi dan Penarikan Dana
type Donation = {
  donor: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
  campaignId: bigint;
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

export default function CampaignDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const campaignId = BigInt(params.id);
  const { isConnected } = useAccount();

  // State
  const [amount, setAmount] = useState("");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Hook untuk transaksi
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({ hash });

  // Hook untuk mengambil data dari contract
  const {
    data: details,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "getCampaignDetails",
    args: [campaignId],
  });

  const {
    data: donations,
    isLoading: isLoadingDonations,
    refetch: refetchDonations,
  } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "getCampaignDonations",
    args: [campaignId],
  });

  const publicClient = usePublicClient();

  // useEffect untuk mengambil riwayat penarikan dana spesifik untuk kampanye ini
  useEffect(() => {
    const fetchWithdrawalLogs = async () => {
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
          args: {
            campaignId: campaignId,
          },
          fromBlock: 0n,
          toBlock: "latest",
        });

        const formattedWithdrawals = withdrawalLogs.map((log) => ({
          campaignId: log.args.campaignId!,
          owner: log.args.owner!,
          amount: log.args.amount!,
        }));
        setWithdrawals(formattedWithdrawals);
      } catch (err) {
        console.error("Gagal mengambil log penarikan dana:", err);
      }
    };

    fetchWithdrawalLogs();
  }, [publicClient, campaignId, isTxSuccess]); // Dijalankan ulang setelah ada transaksi sukses

  const deadline = details ? details[3] : 0n;
  const timeLeft = useCountdown(deadline);
  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Silakan masukkan jumlah donasi yang valid.");
      return;
    }
    writeContract({
      address: CROWDFUNDING_CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "donateToCampaign",
      args: [campaignId],
      value: parseEther(amount),
    });
  };

  useEffect(() => {
    if (isTxSuccess) {
      toast.success("Terima kasih! Donasi Anda telah berhasil dicatat.", {
        duration: 4000,
      });
      setAmount("");
      refetchDetails();
      refetchDonations();
    }
    if (error) {
      if (error.message.includes("User rejected the request")) {
        toast.error("Anda membatalkan transaksi.", { duration: 4000 });
      } else {
        toast.error(`Transaksi Gagal: ${error.message}`, { duration: 4000 });
      }
    }
  }, [isTxSuccess, error, refetchDetails, refetchDonations]);

  if (isLoadingDetails || isLoadingDonations) {
    return (
      <main className="p-4 md:p-8 min-h-[80vh] flex items-center justify-center">
        <div className="text-center p-10 text-white">
          Memuat detail kampanye...
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="p-4 md:p-8 min-h-[80vh] flex items-center justify-center">
        <div className="text-center p-10 text-red-500">
          Gagal memuat kampanye atau kampanye tidak ditemukan.
        </div>
      </main>
    );
  }

  const [title, description, target, _, amountCollected, active] = details;
  const isCampaignInactive = !active || isExpired;

  return (
    <main className="p-4 md:p-8">
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-slate-300 leading-relaxed">{description}</p>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-white/10 h-fit">
            {!isCampaignInactive && (
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-3 text-white">
                  Batas Waktu
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-cyan-900/50 p-2 rounded-md">
                    <p className="text-2xl font-bold text-cyan-400">
                      {String(timeLeft.days).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-slate-400">Hari</p>
                  </div>
                  <div className="bg-cyan-900/50 p-2 rounded-md">
                    <p className="text-2xl font-bold text-cyan-400">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-slate-400">Jam</p>
                  </div>
                  <div className="bg-cyan-900/50 p-2 rounded-md">
                    <p className="text-2xl font-bold text-cyan-400">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-slate-400">Menit</p>
                  </div>
                  <div className="bg-cyan-900/50 p-2 rounded-md">
                    <p className="text-2xl font-bold text-cyan-400">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-slate-400">Detik</p>
                  </div>
                </div>
              </div>
            )}
            <div
              className={`${
                !isCampaignInactive ? "border-t border-white/10 pt-6" : ""
              }`}
            >
              <p className="text-sm text-gray-400">Terkumpul</p>
              <p className="text-3xl font-bold text-cyan-400">
                {formatEther(amountCollected)} ETH
              </p>
              <p className="text-sm text-gray-400 mt-1">
                dari target {formatEther(target)} ETH
              </p>
            </div>
            <h4 className="font-bold text-lg mb-3 border-t border-white/10 pt-4 text-white">
              Donatur
            </h4>
            <div className="max-h-60 overflow-y-auto pr-2">
              {donations && donations.length > 0 ? (
                <ul className="space-y-3">
                  {(donations as Donation[]).map((donation, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm"
                    >
                      <span className="font-mono text-cyan-400">
                        {truncateAddress(donation.donor)}
                      </span>
                      <span className="font-semibold text-white">
                        {formatEther(donation.amount)} ETH
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Belum ada donatur.</p>
              )}
            </div>
            <h4 className="font-bold text-lg mb-3 border-t border-white/10 pt-4 text-white">
              Riwayat Penarikan Dana
            </h4>
            <div className="max-h-60 overflow-y-auto pr-2">
              {withdrawals && withdrawals.length > 0 ? (
                <ul className="space-y-3">
                  {withdrawals.map((withdrawal, index) => (
                    <li
                      key={index}
                      className="bg-yellow-900/30 p-2 rounded-md text-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-yellow-400">
                          Dana Ditarik
                        </span>
                        <span className="font-bold text-white">
                          {formatEther(withdrawal.amount)} ETH
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        oleh{" "}
                        <span className="font-mono">
                          {truncateAddress(withdrawal.owner)}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Belum ada riwayat penarikan.
                </p>
              )}
            </div>
          </div>
          {isConnected && !isCampaignInactive && (
            <div className="bg-slate-800/50 p-6 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-white">
                Ikut Berdonasi
              </h3>
              <form onSubmit={handleDonate}>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-gray-700 w-full rounded-md p-3 pr-12 text-white border border-gray-600 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    ETH
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isPending || isTxLoading}
                  className="w-full mt-4 bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait"
                >
                  {isPending || isTxLoading
                    ? "Memproses Donasi..."
                    : "Donasi Sekarang"}
                </button>
              </form>
            </div>
          )}
          {isCampaignInactive && (
            <p className="text-center text-yellow-500 bg-slate-800/50 p-4 rounded-lg">
              Kampanye ini sudah tidak aktif.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
