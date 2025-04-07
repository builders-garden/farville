import { useGame } from "@/context/GameContext";
import { useApiMutation } from "./use-api-mutation";
import { DbUserHasCollectible } from "@/supabase/types";

export const useUpdateMintPfpUser = ({
  handleUpdateStateCollectibles,
}: {
  handleUpdateStateCollectibles: (
    userHasCollectibles: DbUserHasCollectible
  ) => void;
}) => {
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
    onSuccess: (data: { userHasCollectible: DbUserHasCollectible }) => {
      // update the user mintedPfp to true
      updateUser({ mintedOG: true });
      handleUpdateStateCollectibles(data.userHasCollectible);
    },
  });
};
