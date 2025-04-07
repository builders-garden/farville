import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { DbUserHasCollectible } from "@/supabase/types";

interface UseGenerateMidjourneyImageProps {
  setMidjourneyTaskId: Dispatch<SetStateAction<string | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const useGenerateMidjourneyImage = ({
  setMidjourneyTaskId,
  setIsLoading,
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
      taskId: string;
      userHasCollectible: DbUserHasCollectible;
    }) => {
      setMidjourneyTaskId(data.taskId);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });
};
