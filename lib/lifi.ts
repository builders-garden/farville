import {
  ChainType,
  createConfig,
  EVM,
  getTokenBalancesByChain,
  getTokens,
  TokenAmount,
} from "@lifi/sdk";
import { Address, formatUnits } from "viem";

import { wagmiConfig } from "@/lib/wagmi";
import { getWalletClient, switchChain } from "@wagmi/core";

createConfig({
  integrator: "FarVille",
  // apiKey: env.LIFI_API_KEY,
  providers: [
    EVM({
      getWalletClient: async () => {
        const client = await getWalletClient(wagmiConfig);
        return client;
      },
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId });
        return getWalletClient(wagmiConfig, { chainId: chain.id });
      },
    }),
  ],
});

export const getWalletBalance = async (
  walletAddress: Address
): Promise<{
  totalBalanceUSD: number;
  tokenBalances: { [chainId: number]: TokenAmount[] };
}> => {
  try {
    const tokensResponse = await getTokens({
      chainTypes: [ChainType.EVM],
      minPriceUSD: 0.1,
    });

    const tokenBalances = await getTokenBalancesByChain(
      walletAddress,
      tokensResponse.tokens
    );

    // Filter tokens with positive balances while maintaining the original structure
    const filteredTokenBalances: { [chainId: number]: TokenAmount[] } = {};

    for (const [chainId, balances] of Object.entries(tokenBalances)) {
      filteredTokenBalances[Number(chainId)] = balances.filter(
        (balance) => balance.amount && Number(balance.amount) > 0
      );
    }

    // get wallet total balance in USD
    const walletTotalBalanceUSD = Object.values(filteredTokenBalances).reduce(
      (total, balances) =>
        total +
        balances.reduce(
          (sum, balance) => sum + getTokenBalanceUSDValue(balance),
          0
        ),
      0
    );
    return {
      totalBalanceUSD: walletTotalBalanceUSD,
      tokenBalances: filteredTokenBalances,
    };
  } catch (error) {
    console.error(error);
  }
  return {
    totalBalanceUSD: 0,
    tokenBalances: {},
  };
};

/**
 * Gets the USD value of a token balance
 * @param token The token amount object from LiFi SDK
 * @returns USD value as a number
 */
export function getTokenBalanceUSDValue(token: TokenAmount): number {
  if (!token.amount || Number(token.amount) === 0 || !token.priceUSD) {
    return 0;
  }

  const formattedAmount = formatUnits(
    BigInt(token.amount.toString()),
    token.decimals
  );
  return Number(formattedAmount) * Number(token.priceUSD);
}

/**
 * Formats a token balance for display, taking into account the token's decimals
 * @param token The token amount object from LiFi SDK
 * @param displayDecimals Number of decimals to show in the formatted output (default: 4)
 * @returns Formatted balance as a string
 */
export function formatTokenBalance(
  token: TokenAmount,
  displayDecimals: number = 4
): string {
  if (!token.amount || Number(token.amount) === 0) {
    return "0";
  }

  // Format the amount using the token's decimals
  const formattedAmount = formatUnits(
    BigInt(token.amount.toString()),
    token.decimals
  );

  // Convert to number and fix to the desired display decimals
  return Number(formattedAmount).toFixed(displayDecimals);
}
