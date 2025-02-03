"use client";

import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { DbGridCell } from "@/supabase/types";
import { Dispatch, SetStateAction } from "react";

export const useApplyPerk = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchGridCells,
  refetchUserItems,
  updateGridCells,
  handleOperationCounter,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
  updateGridCells: (cells: Partial<DbGridCell>[]) => void;
  handleOperationCounter: {
    increase: () => void;
    decrease: () => void;
  }
}) => {
  const { playSound } = useAudio();

  const mutation = useApiMutation({
    url: ({
      x,
      y,
    }: {
      x: number;
      y: number;
      itemSlug: string;
      itemId: number;
      setIsLoading: Dispatch<SetStateAction<boolean>>
    }) => `/api/grid-cells/${x}/${y}`,
    body: ({ itemSlug, itemId }: { itemSlug: string; itemId: number }) => ({
      action: "apply-perk",
      itemSlug,
      itemId,
    }),
    onMutate: ({x,y,itemSlug}) => {
      handleOperationCounter.increase();

      // Optimistically update the grid cell based on perk type
      const updates: Partial<DbGridCell> = {
        x,
        y,
      };

      if (itemSlug === "fertilizer") {
        updates.yieldBoost = (updates.yieldBoost || 0) + 1;
      } else {
        updates.speedBoostedAt = new Date().toISOString();
      }

      updateGridCells([updates]);
      playSound("fertilize");
    },
    onSuccess: (
      
    ) => {

      
    },
    onError: () => {
    },
    onSettled: (_data, _error, { setIsLoading }) => {
      handleOperationCounter.decrease();
      setIsLoading(false);
    },
  });

  return mutation;
};
