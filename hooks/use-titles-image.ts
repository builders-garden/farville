import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { UserHasCollectible } from "@prisma/client";
import { CollectibleStatus } from "@/lib/types/game";

export const useTitlesImage = ({
  setIsLoading,
  setTitlesInferenceId,
  inferenceId,
  handleUpdateStateCollectibles,
}: {
  inferenceId?: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setTitlesInferenceId: Dispatch<SetStateAction<string | null>>;
  handleUpdateStateCollectibles: (
    userHasCollectibles: UserHasCollectible
  ) => void;
}) => {
  const { mutate: textToImage } = useApiMutation({
    url: () => `/api/titles/text-to-image`,
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
        inferenceId: string;
        userHasCollectible: UserHasCollectible;
      };
    }) => {
      setTitlesInferenceId(data.data.inferenceId);
      handleUpdateStateCollectibles(data.data.userHasCollectible);
      setIsLoading(false);
    },
    onError: (error: Error) => {
      console.error("Error sending request to Titles:", error);
      setIsLoading(false);
    },
  });

  const { mutate: getTitlesImage } = useApiMutation({
    url: () => `/api/titles/text-to-image/${inferenceId}`,
    body: ({ fid, collectibleId }: { fid: number; collectibleId: number }) => ({
      fid,
      collectibleId,
    }),
    method: "POST",
    onSuccess: (data: {
      success: boolean;
      data: {
        status: CollectibleStatus;
        imageUrls: string[];
        userHasCollectible: UserHasCollectible | null;
      };
    }) => {
      if (
        data.data.status === CollectibleStatus.Generated &&
        data.data.userHasCollectible
      ) {
        handleUpdateStateCollectibles(data.data.userHasCollectible);
      }
      setIsLoading(false);
    },
    onError: (error: Error) => {
      console.error("Error sending request to Titles:", error);
      setIsLoading(false);
    },
  });

  return {
    textToImage,
    getTitlesImage,
  };
};
