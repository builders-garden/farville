"use client";

import { useAudio } from "@/context/AudioContext";
import { SeedType } from "@/types/game";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useDebounce } from "@/hooks/use-debounce";
import { DbGridCell } from "@/supabase/types";
import { CROP_DATA } from "@/lib/game-constants";

export const usePlantSeed = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchGridCells,
  refetchUserItems,
  updateGridCells,
  onSuccess,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchGridCells: () => void;
  refetchUserItems: () => void;
  updateGridCells: (cells: Partial<DbGridCell>[]) => void;
  onSuccess?: () => void;
}) => {
  const { playSound } = useAudio();

  const mutation = useApiMutation({
    url: ({ x, y }: { x: number; y: number; seedType: SeedType }) =>
      `/api/grid-cells/${x}/${y}`,
    body: ({ seedType }) => ({ action: "plant", seedType }),
    onMutate: ({ x, y, seedType }) => {
      if (isActionInProgress) {
        return;
      }
      setIsActionInProgress(true);

      // Optimistically update the grid cell
      const now = new Date();
      const growthTime = CROP_DATA[seedType.replace("-seeds", "")].growthTime;
      const harvestAt = new Date(now.getTime() + growthTime);

      updateGridCells([
        {
          x,
          y,
          cropType: seedType,
          plantedAt: now.toISOString(),
          harvestAt: harvestAt.toISOString(),
          isReadyToHarvest: false,
        },
      ]);

      playSound("plant");
    },
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Plant mutation error:", error);
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
