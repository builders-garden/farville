import { UserHasCollectible } from "@prisma/client";
import { useApiMutation } from "./use-api-mutation";

export const useUpdateMintPfpUser = ({
  handleUpdateStateCollectibles,
  handleSuccessMint,
}: {
  handleUpdateStateCollectibles: (
    userHasCollectibles: UserHasCollectible
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
    onSuccess: (data: { data: { userHasCollectible: UserHasCollectible } }) => {
      handleUpdateStateCollectibles(data.data.userHasCollectible);
      handleSuccessMint(data.data.userHasCollectible.txHash);
    },
  });
};
