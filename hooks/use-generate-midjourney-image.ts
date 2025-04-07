import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { DbUserHasCollectible } from "@/supabase/types";

interface UseGenerateMidjourneyImageProps {
  setMidjourneyTaskId: Dispatch<SetStateAction<string | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  handleUpdateStateCollectibles: (
    userHasCollectibles: DbUserHasCollectible
  ) => void;
}

export const useGenerateMidjourneyImage = ({
  setMidjourneyTaskId,
  setIsLoading,
  handleUpdateStateCollectibles,
}: UseGenerateMidjourneyImageProps) => {
  return useApiMutation({
    url: () => `/api/pfp-nft-image-ask`,
    body: ({
      prompt,
      fid,
      collectibleId,
    }: {
      prompt: string;
      fid: number;
      collectibleId: number;
    }) => ({
      prompt,
      fid,
      collectibleId,
    }),
    method: "POST",
    onSuccess: (data: {
      success: boolean;
      data: {
        taskId: string;
        userHasCollectible: DbUserHasCollectible;
      };
    }) => {
      setMidjourneyTaskId(data.data.taskId);
      setIsLoading(false);
      handleUpdateStateCollectibles(data.data.userHasCollectible);
    },
    onError: () => {
      setIsLoading(false);
    },
  });
};
