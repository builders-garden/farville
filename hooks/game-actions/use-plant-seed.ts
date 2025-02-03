"use client";

import { useAudio } from "@/context/AudioContext";
import { SeedType } from "@/types/game";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { DbGridCell } from "@/supabase/types";
import { CROP_DATA } from "@/lib/game-constants";
import { Dispatch, SetStateAction } from "react";

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
    url: ({ x, y }: { x: number; y: number; seedType: SeedType; setIsLoading: Dispatch<SetStateAction<boolean>> }) =>
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
    onSettled: (_data, _error, { setIsLoading }) => {
      setIsActionInProgress(false);
      setIsLoading(false);
    },
  });

  return mutation;
};
