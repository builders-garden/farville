import { useGame } from "@/context/GameContext";
import { useApiMutation } from "./use-api-mutation";

export const useUpdateMintOgUser = () => {
  const { updateUser } = useGame();

  return useApiMutation({
    url: () => `/api/users/me/mint-og`,
    method: "POST",
    body: ({ nftId }: { nftId: number }) => ({
      tokenId: nftId,
    }),
    onSuccess: () => {
      // update the user mintedOG to true
      updateUser({ mintedOG: true });
    },
  });
};
