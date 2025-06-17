// File: frontend/app/components/CampaignCard.tsx

"use client";

import { formatEther } from "viem";
import Link from "next/link";
import { useCountdown } from "../hooks/useCountdown";

type Campaign = {
  id: bigint;
  title: string;
  description: string;
  target: bigint;
  deadline: bigint;
  amountCollected: bigint;
  active: boolean;
};

const calculatePercentage = (goal: bigint, raised: bigint) => {
  if (goal === 0n) return 0;
  const percentage = (Number(raised) / Number(goal)) * 100;
  return Math.min(percentage, 100);
};

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const percentage = calculatePercentage(
    campaign.target,
    campaign.amountCollected
  );
  const timeLeft = useCountdown(campaign.deadline);

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;
  const isInactive = !campaign.active;

  // Tentukan teks status berdasarkan kondisi
  let statusText = `${timeLeft.days} hari ${timeLeft.hours} jam lagi`;
  let statusColor = "text-gray-300";
  if (isInactive) {
    statusText = "Nonaktif";
    statusColor = "text-yellow-500";
  } else if (isExpired) {
    statusText = "Kampanye Berakhir";
    statusColor = "text-red-500";
  }

  return (
    <Link
      href={`/campaign/${campaign.id.toString()}`}
      key={campaign.id.toString()}
    >
      <div
        className={`bg-slate-800/50 border border-white/10 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 p-5 flex flex-col h-full hover:border-cyan-400/50 ${
          isInactive || isExpired ? "opacity-60 grayscale" : ""
        }`}
      >
        <h3 className="text-xl font-bold text-white truncate">
          {campaign.title}
        </h3>
        <p className="text-gray-400 mt-2 h-24 overflow-hidden text-ellipsis flex-grow">
          {campaign.description}
        </p>
        <div className="mt-4">
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                isInactive || isExpired ? "bg-gray-500" : "bg-cyan-500"
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-white font-semibold">
              {percentage.toFixed(2)}%
            </span>
            {/* --- TAMPILKAN TEKS STATUS BARU --- */}
            <span className={`font-semibold ${statusColor}`}>{statusText}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-white">
          <div>
            <p className="text-xs text-gray-400">Terkumpul</p>
            <p className="font-bold">
              {formatEther(campaign.amountCollected)} ETH
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Target</p>
            <p className="font-bold">{formatEther(campaign.target)} ETH</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
