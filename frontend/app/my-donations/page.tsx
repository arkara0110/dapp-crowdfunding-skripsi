// File: frontend/app/my-donations/page.tsx

"use client";

import { useAccount, useReadContract } from "wagmi";
import { CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from "@/constants";
import Link from "next/link";
import { formatEther } from "viem";

type Donation = {
  donor: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
  campaignId: bigint;
};

export default function MyDonationsPage() {
  const { address: connectedAddress, isConnected } = useAccount();

  const { data: donationHistory, isLoading } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "getDonorHistory",
    args: [connectedAddress!],
    query: {
      enabled: isConnected,
    },
  });

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-white/10">
          <p className="text-yellow-500">
            Silakan hubungkan dompet Anda untuk melihat riwayat donasi.
          </p>
        </div>
      );
    }
    if (isLoading) {
      return (
        <p className="text-center text-gray-400">Memuat riwayat donasi...</p>
      );
    }
    if (!donationHistory || donationHistory.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mt-4">
            Riwayat Donasi Kosong
          </h3>
          <p className="text-slate-400 mt-2">
            Semua kebaikan yang Anda berikan akan tercatat di sini.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700"
          >
            Lihat Kampanye Aktif
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {(donationHistory as Donation[]).map((donation, index) => {
          const donationDate = new Date(Number(donation.timestamp) * 1000);

          // Format tanggal dan waktu menjadi lebih spesifik
          const formattedDateTime = donationDate
            .toLocaleString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false, // Gunakan format 24 jam
            })
            .replace(/\./g, ":"); // Ganti titik dengan titik dua untuk waktu

          return (
            <div
              key={index}
              className="bg-slate-800/50 p-4 rounded-lg border border-white/10 flex justify-between items-center transition-all hover:border-cyan-400/50 hover:bg-slate-800"
            >
              <div>
                <p className="text-sm text-gray-400">
                  Anda berdonasi ke{" "}
                  <Link
                    href={`/campaign/${donation.campaignId.toString()}`}
                    className="text-cyan-400 hover:underline"
                  >
                    Kampanye #{donation.campaignId.toString()}
                  </Link>
                </p>
                <p className="text-xl font-bold text-white">
                  {formatEther(donation.amount)} ETH
                </p>
              </div>
              {/* Tampilkan tanggal dan waktu yang sudah diformat */}
              <p className="text-sm text-gray-500 font-mono">
                {formattedDateTime}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="p-4 md:p-8">
      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          Riwayat Donasi Saya
        </h2>
        {renderContent()}
      </section>
    </main>
  );
}
