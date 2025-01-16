"use client";

import { useAudio } from "@/context/AudioContext";
import { SeedType } from "@/types/game";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const usePlantSeed = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchGridCells,
  refetchUserItems,
  onSuccess,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchGridCells: () => void;
  refetchUserItems: () => void;
  onSuccess?: () => void;
}) => {
  const { playSound } = useAudio();

  return useApiMutation({
    url: ({ x, y }: { x: number; y: number; seedType: SeedType }) =>
      `/api/grid-cells/${x}/${y}`,
    body: ({ seedType }) => ({ action: "plant", seedType }),
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
      playSound("plant");
      onSuccess?.();
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
