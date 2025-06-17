// File: frontend/app/components/Header.tsx
"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    // --- UBAH CLASSNAME DI SINI ---
    <header className="sticky top-0 z-50 flex justify-between items-center p-4 md:px-8 border-b border-white/10 bg-slate-900/50 backdrop-blur-lg">
      <Link href="/">
        <h1 className="text-3xl font-bold text-cyan-400 hover:text-cyan-300">
          Crowdfunding dApp
        </h1>
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/about"
          className="text-gray-300 hover:text-white font-semibold transition-colors"
        >
          Tentang Kami
        </Link>
        <Link
          href="/my-donations"
          className="text-gray-300 hover:text-white font-semibold transition-colors"
        >
          Donasi Saya
        </Link>
        <Link
          href="/admin"
          className="text-gray-300 hover:text-white font-semibold transition-colors"
        >
          Admin
        </Link>
        <ConnectButton />
      </div>
    </header>
  );
}
