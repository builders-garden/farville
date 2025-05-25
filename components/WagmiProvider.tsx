"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DaimoPayProvider } from "@daimo/pay";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
// import { daimoTheme } from "@/lib/daimo-theme";

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider
        // customTheme={daimoTheme}
        >
          {children}
        </DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
