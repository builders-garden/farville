import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const useGetMidjourneyImage = ({
  setMidjourneyImageUrl,
  setMidjourneyImageUrls,
  setIsLoading,
}: {
  setMidjourneyImageUrl: Dispatch<SetStateAction<string | null>>;
  setMidjourneyImageUrls: Dispatch<SetStateAction<string[] | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
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
    }) => {
      setMidjourneyImageUrl(data.imageUrl);
      setMidjourneyImageUrls(data.imageUrls);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });
};
