// File: frontend/app/client-providers.tsx

"use client";

// Impor useState dari React
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";

// Definisikan konektor di luar. Bagian ini aman untuk server.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet],
    },
  ],
  {
    appName: "Crowdfunding dApp",
    // Ganti dengan Project ID Anda dari WalletConnect Cloud
    projectId: "ef2f27ae76009a8049ae3bc00d3b95f7",
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  // === PERUBAHAN UTAMA DI SINI ===
  // Kita membuat config dan queryClient di dalam useState.
  // Ini memastikan keduanya hanya dibuat sekali dan HANYA di sisi client.
  const [config] = useState(() =>
    createConfig({
      connectors,
      chains: [hardhat],
      transports: {
        [hardhat.id]: http("http://127.0.0.1:8545"),
      },
    })
  );

  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
