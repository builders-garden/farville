import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const useGetImageDescription = ({
  setImageDescription,
  setImageDescriptionLoading,
}: {
  setImageDescription: Dispatch<SetStateAction<string | null>>;
  setImageDescriptionLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  return useApiMutation({
    url: () => `/api/pfp-nft-text`,
    body: ({ imageUrl }: { imageUrl: string }) => ({
      imageUrl,
    }),
    method: "POST",
    onSuccess: (data: { success: boolean; data: { description: string } }) => {
      setImageDescription(data.data.description);
      setImageDescriptionLoading(false);
    },
    onError: (error: Error) => {
      console.error("Error getting image description:", error);
      setImageDescriptionLoading(false);
    },
  });
};
