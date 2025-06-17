"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import toast from "react-hot-toast";

import { CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from "@/constants";
import Link from "next/link";

type Campaign = {
  id: bigint;
  title: string;
  description: string;
  target: bigint;
  deadline: bigint;
  amountCollected: bigint;
  active: boolean;
};

export default function AdminPage() {
  const { address: connectedAddress, isConnected } = useAccount();

  // --- State untuk Form Create Campaign ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  // --- State untuk melacak ID kampanye yang sedang diproses withdraw ---
  const [processingId, setProcessingId] = useState<bigint | null>(null);

  // --- Hook untuk semua transaksi TULIS (Create dan Withdraw) ---
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({ hash });

  // --- Hook untuk BACA data ---
  const { data: ownerAddress, isLoading: isLoadingOwner } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "owner",
  });

  const {
    data: campaigns,
    isLoading: isLoadingCampaigns,
    refetch: refetchCampaigns,
  } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "getAllCampaigns",
  });

  // --- Fungsi Handler ---
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !target || !deadline) {
      toast.error("Harap isi semua kolom.");
      return;
    }
    const targetInWei = parseEther(target);
    const deadlineInSeconds = BigInt(
      Math.floor(new Date(deadline).getTime() / 1000)
    );
    writeContract({
      address: CROWDFUNDING_CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "createCampaign",
      args: [title, description, targetInWei, deadlineInSeconds],
    });
  };

  const handleWithdraw = (campaignId: bigint) => {
    setProcessingId(campaignId);
    writeContract({
      address: CROWDFUNDING_CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "withdrawCampaignFunds",
      args: [campaignId],
    });
  };

  useEffect(() => {
    if (isTxSuccess) {
      toast.success("Transaksi berhasil!", { duration: 5000 });
      setTitle("");
      setDescription("");
      setTarget("");
      setDeadline("");
      setProcessingId(null);
      refetchCampaigns();
    }
    if (error) {
      if (error.message.includes("User rejected the request")) {
        toast.error("Anda membatalkan transaksi.", { duration: 5000 });
      } else {
        toast.error(`Transaksi Gagal: ${error.message}`, { duration: 5000 });
      }
      setProcessingId(null);
    }
  }, [isTxSuccess, error, refetchCampaigns]);

  // Gabungkan kedua status loading menjadi satu
  if (isLoadingOwner || isLoadingCampaigns) {
    return (
      <div className="text-center p-10 text-white">Memuat data admin...</div>
    );
  }

  // Gerbang pengaman untuk non-pemilik
  if (!isConnected || connectedAddress !== ownerAddress) {
    return (
      // Gunakan flexbox untuk memposisikan konten di tengah secara vertikal dan horizontal
      <main className="flex flex-col items-center justify-center text-center py-20">
        {/* Ikon Gembok untuk visual */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-red-500 mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>

        <h1 className="text-4xl font-bold text-red-500 mb-4">Akses Ditolak</h1>
        <p className="max-w-md text-slate-400">
          Halaman ini hanya untuk pemilik (admin). Silakan hubungkan dompet
          pemilik untuk melanjutkan.
        </p>

        {/* Tombol untuk kembali ke halaman utama */}
        <Link
          href="/"
          className="mt-8 bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8">
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          Selamat Datang, Admin!
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kolom untuk Membuat Kampanye Baru */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-white/10 h-fit">
            <h3 className="text-xl font-bold mb-4 text-white">
              Buat Kampanye Baru
            </h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-300"
                >
                  Judul
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="target"
                  className="block text-sm font-medium text-gray-300"
                >
                  Target (ETH)
                </label>
                <input
                  type="number"
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-300"
                >
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || isTxLoading}
                className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait"
              >
                {isPending || isTxLoading ? "Memproses..." : "Buat Kampanye"}
              </button>
            </form>
          </div>

          {/* Kolom untuk Mengelola Kampanye */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-bold mb-4 text-white">
              Kelola Kampanye
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {campaigns && campaigns.length > 0 ? (
                (campaigns as Campaign[]).map((campaign) => {
                  const nowInSeconds = BigInt(Math.floor(Date.now() / 1000));
                  const isExpired = campaign.deadline <= nowInSeconds;

                  let statusText = "Aktif";
                  let statusColor = "bg-green-500/20 text-green-400";
                  if (!campaign.active) {
                    statusText = "Nonaktif";
                    statusColor = "bg-gray-500/20 text-gray-400";
                  } else if (isExpired) {
                    statusText = "Berakhir";
                    statusColor = "bg-red-500/20 text-red-400";
                  }

                  return (
                    <div
                      key={campaign.id.toString()}
                      className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white">{campaign.title}</p>
                        <p className="text-sm text-gray-400">
                          Terkumpul: {formatEther(campaign.amountCollected)} ETH
                        </p>
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-2 inline-block ${statusColor}`}
                        >
                          {statusText}
                        </span>
                      </div>
                      <button
                        onClick={() => handleWithdraw(campaign.id)}
                        disabled={
                          campaign.amountCollected === 0n ||
                          isPending ||
                          isTxLoading
                        }
                        className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        {(isPending || isTxLoading) &&
                        processingId === campaign.id
                          ? "Memproses..."
                          : "Tarik Dana"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">
                  Tidak ada kampanye untuk dikelola.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
