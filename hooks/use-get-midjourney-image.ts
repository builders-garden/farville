import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { UserHasCollectible } from "@prisma/client";

export const useGetMidjourneyImage = ({
  setMidjourneyImageUrl,
  setMidjourneyImageUrls,
  setIsLoading,
  handleUpdateStateCollectibles,
  setErrorOnGeneration,
}: {
  setMidjourneyImageUrl: Dispatch<SetStateAction<string | null>>;
  setMidjourneyImageUrls: Dispatch<SetStateAction<string[] | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  handleUpdateStateCollectibles: (
    userHasCollectibles: UserHasCollectible
  ) => void;
  setErrorOnGeneration: Dispatch<SetStateAction<boolean>>;
}) => {
  return useApiMutation({
    url: () => `/api/pfp-nft-image-get`,
    body: ({
      taskId,
      fid,
      collectibleId,
    }: {
      taskId: string;
      fid: string;
      collectibleId: string;
    }) => ({
      taskId,
      fid,
      collectibleId,
    }),
    method: "POST",
    onSuccess: (data: {
      status: string;
      imageUrl: string;
      imageUrls: string[];
      userHasCollectible?: UserHasCollectible;
    }) => {
      // set stuff only if it's not still polling
      if (data.status !== "pending") {
        setMidjourneyImageUrl(data.imageUrl);
        setMidjourneyImageUrls(data.imageUrls);
        setIsLoading(false);
        if (data.userHasCollectible) {
          handleUpdateStateCollectibles(data.userHasCollectible);
        }
      }
    },
    onError: (error) => {
      console.error("Error getting Midjourney image:", error);
      setIsLoading(false);
      setErrorOnGeneration(true);
    },
  });
};
