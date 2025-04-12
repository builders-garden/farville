import { useApiMutation } from "./use-api-mutation";
import { DbUserHasCollectible } from "@/supabase/types";

export const useUpdateMintPfpUser = ({
  handleUpdateStateCollectibles,
  handleSuccessMint,
}: {
  handleUpdateStateCollectibles: (
    userHasCollectibles: DbUserHasCollectible
  ) => void;
  handleSuccessMint: (hash: string | null) => void;
}) => {
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
    onSuccess: (data: {
      data: { userHasCollectible: DbUserHasCollectible };
    }) => {
      handleUpdateStateCollectibles(data.data.userHasCollectible);
      handleSuccessMint(data.data.userHasCollectible.txHash);
    },
  });
};
