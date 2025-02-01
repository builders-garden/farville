"use client";

import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useDebounce } from "@/hooks/use-debounce";
import { DbGridCell } from "@/supabase/types";

export const useApplyPerk = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchGridCells,
  refetchUserItems,
  updateGridCells,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
  updateGridCells: (cells: Partial<DbGridCell>[]) => void;
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
    }) => `/api/grid-cells/${x}/${y}`,
    body: ({ itemSlug, itemId }: { itemSlug: string; itemId: number }) => ({
      action: "apply-perk",
      itemSlug,
      itemId,
    }),
    onMutate: ({ x, y, itemSlug }) => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);

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
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
    },
    onError: () => {
      // On error, refetch to restore correct state
      refetchGridCells();
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });

  return {
    ...mutation,
    mutate: useDebounce(mutation.mutate, 500),
  };
};
