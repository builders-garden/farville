import { createConfig, http } from "wagmi";
import { base } from "viem/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { getDefaultConfig } from "@daimo/pay";
import { env } from "@/lib/env";

const chains = [base] as const;

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Farville",
    appIcon: `${env.NEXT_PUBLIC_URL}/images/icon.png`,
    appDescription: "Farville",
    appUrl: env.NEXT_PUBLIC_URL,
    ssr: true,
    chains: chains,
    transports: {
      [base.id]: http(), //"https://base.llamarpc.com"),
    },
    additionalConnectors: [farcasterFrame()],
  })
);
