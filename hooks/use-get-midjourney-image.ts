import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { DbUserHasCollectible } from "@/supabase/types";

export const useGetMidjourneyImage = ({
  setMidjourneyImageUrl,
  setMidjourneyImageUrls,
  setIsLoading,
  handleUpdateStateCollectibles,
}: {
  setMidjourneyImageUrl: Dispatch<SetStateAction<string | null>>;
  setMidjourneyImageUrls: Dispatch<SetStateAction<string[] | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  handleUpdateStateCollectibles: (
    userHasCollectibles: DbUserHasCollectible
  ) => void;
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
      userHasCollectible?: DbUserHasCollectible;
    }) => {
      setMidjourneyImageUrl(data.imageUrl);
      setMidjourneyImageUrls(data.imageUrls);
      setIsLoading(false);
      if (data.userHasCollectible) {
        handleUpdateStateCollectibles(data.userHasCollectible);
      }
    },
    onError: () => {
      setIsLoading(false);
    },
  });
};
