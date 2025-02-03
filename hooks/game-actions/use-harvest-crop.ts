"use client";

import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { DbGridCell, DbItem } from "@/supabase/types";
import { FloatingNumberData } from "@/context/GameContext";
import { CropType } from "@/types/game";
import { Dispatch, SetStateAction } from "react";

interface HarvestResponse {
  crop: DbItem;
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
  updateGridCells,
  setFloatingNumbers,
  setShowLevelUpConfetti,
  handleOperationCounter,
}: {
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
  refetchUser: () => Promise<void>;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  updateGridCells: (cells: Partial<DbGridCell>[]) => void;
  setFloatingNumbers: (
    fn: (prev: FloatingNumberData[]) => FloatingNumberData[]
  ) => void;
  setShowLevelUpConfetti: (show: boolean) => void;
  handleOperationCounter: {
    increase: () => void;
    decrease: () => void;
  }
}) => {
  const { playSound } = useAudio();
  const mutation = useApiMutation<HarvestResponse, { x: number; y: number; setIsLoading: Dispatch<SetStateAction<boolean>> }>({
    url: (variables) => `/api/grid-cells/${variables.x}/${variables.y}`,
    body: () => ({ action: "harvest" }),
    onMutate: () => {
      handleOperationCounter.increase();
    },
    onSuccess: (data, variables) => {
      const {x, y} = variables;
      // Optimistically update the grid cell
      updateGridCells([
        {
          x,
          y,
          cropType: null,
          plantedAt: null,
          harvestAt: null,
          isReadyToHarvest: false,
        },
      ]);
      playSound("harvest");
      // Add floating numbers for XP and harvest amount
      const newFloatingNumber = {
        x: x * 32, // Adjust multiplier based on your grid cell size
        y: y * 32,
        gridX: x,
        gridY: y,
        exp: data.rewards.xp,
        amount: data.rewards.amount,
        cropType: data.crop?.slug as CropType,
        id: Math.random().toString(),
      };
      setFloatingNumbers((prev) => [...prev, newFloatingNumber]);

      // Show level up confetti if player leveled up
      if (data.rewards.didLevelUp) {
        setShowLevelUpConfetti(true);
        playSound("levelUp");
        // Reset confetti after animation
        setTimeout(() => {
          setShowLevelUpConfetti(false);
        }, 3000);
      }
    },
    onError: () => {
      // On error, refetch to restore correct state
      // refetchGridCells();
    },
    onSettled: (_data, _error, { setIsLoading }) => {
      handleOperationCounter.decrease();
      setIsLoading(false);
    },
  });

  return mutation;
};
