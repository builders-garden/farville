"use client";

import dynamic from "next/dynamic";
import { AudioProvider } from "./context/AudioContext";
import { GameProvider } from "./context/GameContext";

const WagmiProvider = dynamic(
  () => import("./components/WagmiProvider"),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <AudioProvider>
        <GameProvider>{children}</GameProvider>
      </AudioProvider>
    </WagmiProvider>
  );
}
