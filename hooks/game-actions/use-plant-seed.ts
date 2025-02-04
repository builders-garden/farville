"use client";

import { useAudio } from "@/context/AudioContext";
import { CropType, SeedType } from "@/types/game";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { DbGridCell } from "@/supabase/types";
import { CROP_DATA } from "@/lib/game-constants";
import { Dispatch, SetStateAction } from "react";
import { UserItem } from "../use-user-items";

export const usePlantSeed = ({
  updateGridCells,
  updateUserItems,
  onSuccess,
  handleOperationCounter,
}: {
  updateGridCells: (cells: Partial<DbGridCell>[]) => void;
  updateUserItems: (updatedItems: Partial<UserItem>[]) => void
  onSuccess?: () => void;
  handleOperationCounter: {
    increase: () => void;
    decrease: () => void;
  }
}) => {
  const { playSound } = useAudio();

  const mutation = useApiMutation({
    url: ({ x, y }: { x: number; y: number; seedType: SeedType; item: UserItem; setIsLoading: Dispatch<SetStateAction<boolean>> }) =>
      `/api/grid-cells/${x}/${y}`,
    body: ({ seedType }) => ({ action: "plant", seedType }),
    onMutate: ({ x, y, seedType, item }) => {
      handleOperationCounter.increase();

      // Optimistically update the grid cell
      const now = new Date();
      const growthTime = CROP_DATA[seedType.replace("-seeds", "")].growthTime;
      const harvestAt = new Date(now.getTime() + growthTime);

      updateGridCells([
        {
          x,
          y,
          cropType: seedType.replace("-seeds", "") as CropType,
          plantedAt: now.toISOString(),
          harvestAt: harvestAt.toISOString(),
          isReadyToHarvest: false,
        },
      ]);

      updateUserItems([
        {
          itemId: item.id,
          quantity: item.quantity - 1,
          item: {
            ...item.item,
            category: "seed",
          }
        }
      ]);

      playSound("plant");
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Plant mutation error:", error);
    },
    onSettled: (_data, _error, { setIsLoading }) => {
      handleOperationCounter.decrease();
      setIsLoading(false);
    },
  });

  return mutation;
};
