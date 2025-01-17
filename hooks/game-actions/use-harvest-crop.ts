"use client";

import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface HarvestResponse {
  rewards: {
    xp: number;
    amount: number;
    didLevelUp: boolean;
    newLevel?: number;
  };
}

export const useHarvestCrop = ({
  refetchGridCells,
  refetchUserItems,
  refetchUser,
  isActionInProgress,
  setIsActionInProgress,
}: {
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
  refetchUser: () => Promise<void>;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  const { playSound } = useAudio();

  return useApiMutation<HarvestResponse, { x: number; y: number }>({
    url: (variables) => `/api/grid-cells/${variables.x}/${variables.y}`,
    body: () => ({ action: "harvest" }),
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: (data) => {
      refetchGridCells();
      refetchUserItems();
      refetchUser();
      playSound("harvest");
      if (data.rewards.didLevelUp) {
        playSound("levelUp");
      }
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
