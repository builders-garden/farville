import { useGame } from "@/context/GameContext";
import { useApiMutation } from "./use-api-mutation";

export const useUpdateMintPfpUser = () => {
  const { updateUser } = useGame();

  return useApiMutation({
    url: () => `/api/users/me/mint-pfp`,
    method: "POST",
    body: ({
      collectibleId,
      txHash,
    }: {
      collectibleId: number;
      txHash: string;
    }) => ({
      collectibleId,
      txHash,
    }),
    onSuccess: () => {
      // update the user mintedPfp to true
      updateUser({ mintedOG: true });
    },
  });
};
