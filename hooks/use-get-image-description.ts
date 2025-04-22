import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { UserHasCollectible } from "@prisma/client";

export const useGetImageDescription = ({
  setImageDescription,
  setImageDescriptionLoading,
  setIsLoading,
  handleUpdateStateCollectibles,
}: {
  setImageDescription: Dispatch<SetStateAction<string | null>>;
  setImageDescriptionLoading: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  handleUpdateStateCollectibles: (
    userHasCollectibles: UserHasCollectible
  ) => void;
}) => {
  return useApiMutation({
    url: () => `/api/pfp-nft-text`,
    body: ({
      imageUrl,
      fid,
      collectibleId,
    }: {
      imageUrl: string;
      fid: number;
      collectibleId: number;
    }) => ({
      imageUrl,
      fid,
      collectibleId,
    }),
    method: "POST",
    onSuccess: (data: {
      success: boolean;
      data: {
        description: string;
        userHasCollectible: UserHasCollectible;
      };
    }) => {
      setImageDescription(data.data.description);
      setImageDescriptionLoading(false);
      handleUpdateStateCollectibles(data.data.userHasCollectible);
      setIsLoading(false);
    },
    onError: (error: Error) => {
      console.error("Error getting image description:", error);
      setImageDescriptionLoading(false);
    },
  });
};
