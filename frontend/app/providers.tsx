// File: frontend/app/providers.tsx

"use client"; // Ini adalah Client Component

import dynamic from "next/dynamic";

// Di sinilah kita melakukan dynamic import dengan ssr: false
// Karena file ini adalah Client Component, ini DIIZINKAN.
const ClientProvider = dynamic(
  () => import("./client-providers.tsx").then((mod) => mod.Providers),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return <ClientProvider>{children}</ClientProvider>;
}
