"use client";

import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { DbGridCell } from "@/supabase/types";
import { Dispatch, SetStateAction } from "react";
import { UserItem } from "../use-user-items";

export const useApplyPerk = ({
  updateGridCells,
  updateUserItems,
  handleOperationCounter,
}: {
  updateGridCells: (cells: Partial<DbGridCell>[]) => void;
  updateUserItems: (updatedItems: Partial<UserItem>[]) => void
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
      item?: UserItem;
      setIsLoading: Dispatch<SetStateAction<boolean>>
    }) => `/api/grid-cells/${x}/${y}`,
    body: ({ itemSlug, item }: { itemSlug: string; item?: UserItem }) => ({
      action: "apply-perk",
      itemSlug,
      itemId: item?.id || 0,
    }),
    onMutate: ({x,y,itemSlug,item}) => {
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
      if (item) {
        updateUserItems([
          { 
            itemId: item.id, 
            quantity: item.quantity - 1, 
            item: { 
              ...item.item, 
              category: "perk"
            }
          }
        ]);
      }
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
