import { useApiMutation } from "./use-api-mutation";

export const useUpdateMintOgUser = () => {
  return useApiMutation({
    url: () => `/api/users/me/mint-og`,
    method: "POST",
    body: ({ nftId }: { nftId: number }) => ({
      tokenId: nftId,
    }),
    onSuccess: () => {
      // update the user mintedOG to true
      console.log("Minted OG NFT successfully");
    },
  });
};
