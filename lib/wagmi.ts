import { createConfig, http } from "wagmi";
import {
  mainnet,
  base,
  degen,
  polygon,
  gnosis,
  avalanche,
  arbitrum,
  optimism,
  zora,
  zksync,
  unichain,
} from "viem/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { frameConnector } from "@/lib/connector";

import { getDefaultConfig } from "@daimo/pay";
import { env } from "@/lib/env";

const chains = [
  mainnet,
  base,
  polygon,
  degen,
  gnosis,
  arbitrum,
  avalanche,
  optimism,
  unichain,
  zora,
  zksync,
] as const;

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Farville",
    appIcon: `${env.NEXT_PUBLIC_URL}/images/icon.png`,
    appDescription: "Farville",
    appUrl: env.NEXT_PUBLIC_URL,
    walletConnectProjectId: env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    ssr: true,
    chains: chains,
    transports: {
      [mainnet.id]: http(), //"https://mainnet.llamarpc.com"),
      [base.id]: http(), //"https://base.llamarpc.com"),
      [polygon.id]: http(), //"https://polygon.llamarpc.com"),
      [degen.id]: http(), //"https://degen.llamarpc.com"),
      [gnosis.id]: http(), //"https://gnosis.llamarpc.com"),
      [arbitrum.id]: http(), //"https://arbitrum.llamarpc.com"),
      [avalanche.id]: http(), //"https://1rpc.io/avax/c"),
      [optimism.id]: http(), //"https://optimism.llamarpc.com"),
      [unichain.id]: http(), //"https://unichain-rpc.publicnode.com"),
      [zora.id]: http(), //"https://rpc.zora.energy"),
      [zksync.id]: http(), //"https://mainnet.era.zksync.io"),
    },
    additionalConnectors: [farcasterFrame(), frameConnector()],
  })
);
