// File: frontend/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { Providers } from "./providers";
import { Header } from "./components/Header";

// 1. Impor Toaster
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crowdfunding dApp",
  description: "Decentralized Crowdfunding Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Hapus bg-gray-900 dari sini karena sudah di globals.css */}
      <body className={inter.className}>
        <Providers>
          <Toaster position="top-center" reverseOrder={false} />
          <Header />
          {/* Bungkus children dengan container */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
