import { createConfig, getToken } from "@lifi/sdk";
import { base } from "viem/chains";

import { BASE_WETH_ADDRESS, BASE_ETH_ADDRESS } from "@/lib/contracts/constants";

createConfig({
  integrator: "Farville",
  // apiKey: env.LIFI_API_KEY,
});

export const getLatestWETHPrice = async (): Promise<number> => {
  try {
    const token = await getToken(base.id, BASE_WETH_ADDRESS);
    if (!token.priceUSD) throw new Error("WETH price not found");
    return Number(token.priceUSD);
  } catch (error) {
    console.error(
      "Error getting WETH price from LiFi, fetching from pyth:",
      error
    );
    return 0;
  }
};

export const getLatestETHPrice = async (): Promise<number> => {
  try {
    const token = await getToken(base.id, BASE_ETH_ADDRESS);
    if (!token.priceUSD) throw new Error("ETH price not found");
    return Number(token.priceUSD);
  } catch (error) {
    console.error(
      "Error getting ETH price from LiFi, fetching from pyth:",
      error
    );
    return 0;
  }
};
