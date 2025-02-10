"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { GridBulkRequest } from "@/app/api/grid-bulk/route";

export const useGridBulkOperations = () => {
  const mutation = useApiMutation({
    url: "/api/grid-bulk",
    body: (gridBulkOperation: GridBulkRequest) => gridBulkOperation,
    onMutate: ({}) => {
      // handleOperationCounter.increase();
      // Optimistically update the grid cell
      // const now = new Date();
      // const growthTime = CROP_DATA[seedType.replace("-seeds", "")].growthTime;
      // const harvestAt = new Date(now.getTime() + growthTime);
      // updateGridCells([
      //   {
      //     x,
      //     y,
      //     cropType: seedType.replace("-seeds", "") as CropType,
      //     plantedAt: now.toISOString(),
      //     harvestAt: harvestAt.toISOString(),
      //     isReadyToHarvest: false,
      //   },
      // ]);
      // updateUserItems([
      //   {
      //     itemId: item.id,
      //     quantity: item.quantity - 1,
      //     item: {
      //       ...item.item,
      //       category: "seed",
      //     }
      //   }
      // ]);
    },
    onSuccess: () => {
      // onSuccess?.();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
    // onSettled: (_data, _error, {}) => {
    //   // setIsLoading(false);
    // },
  });

  return mutation;
};
