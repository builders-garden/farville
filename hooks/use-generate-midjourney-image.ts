import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";

export const useGenerateMidjourneyImage = ({
  setMidjourneyTaskId,
  setIsLoading,
}: {
  setMidjourneyTaskId: Dispatch<SetStateAction<string | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}) => {
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
    onSuccess: (data: { taskId: string }) => {
      setMidjourneyTaskId(data.taskId);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });
};
