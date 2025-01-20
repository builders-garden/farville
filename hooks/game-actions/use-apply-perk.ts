"use client";

import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const useApplyPerk = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchGridCells,
  refetchUserItems,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
}) => {
  const { playSound } = useAudio();
  const mutation = useApiMutation({
    url: ({ x, y }: { x: number; y: number; itemSlug: string; itemId: number }) => `/api/grid-cells/${x}/${y}`,
    body: ({ itemSlug, itemId }: { itemSlug: string; itemId: number }) => ({ action: "apply-perk", itemSlug, itemId }),
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
      playSound("fertilize");
    },
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });

  return mutation;
};
