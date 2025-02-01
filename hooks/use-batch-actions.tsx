import { useState, useCallback, useEffect } from "react";
import { useApiMutation } from "./use-api-mutation";
import {
  ActionResult,
  HarvestActionResult,
} from "@/app/api/batch-actions/route";
import type { CropType, SeedType } from "@/types/game";
import { useActionQueue } from "./use-action-queue";

export type ActionType = "plant" | "harvest" | "fertilize" | "perk";

export interface BatchedAction {
  type: ActionType;
  x: number;
  y: number;
  params?: {
    seedType?: SeedType;
    itemSlug?: string;
    itemId?: number;
  };
}

interface UseBatchActionsProps {
  onProcessStart?: (x: number, y: number) => void;
  onProcessComplete?: (actions: ActionResult[]) => void;
  onCellComplete?: (x: number, y: number) => void;
  onLevelUp?: () => void;
  onHarvestReward?: (params: {
    x: number;
    y: number;
    exp: number;
    amount: number;
    cropType: CropType;
  }) => void;
  playSound?: (sound: string) => void;
  onAddAction?: (action: BatchedAction) => void;
}

export function useBatchActions({
  onProcessComplete,
  onProcessStart,
  onCellComplete,
  onLevelUp,
  onHarvestReward,
  playSound,
  onAddAction,
}: UseBatchActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutate: processAction } = useApiMutation<
    ActionResult[],
    BatchedAction
  >({
    url: "/api/batch-actions",
    method: "POST",
    body: (action) => ({ actions: [action] }), // Wrap single action in array
    onMutate: (action) => {
      console.log("🚀 Starting action:", action);
      onProcessStart?.(action.x, action.y);
    },
    onError: (error) => {
      console.error("❌ Action failed:", error);
    },
    onSuccess: async (results) => {
      console.log("✅ Action completed with results:", results);

      const result = results[0]; // We only expect one result

      if (onCellComplete && result.cell) {
        if (
          typeof result.cell.x === "number" &&
          typeof result.cell.y === "number"
        ) {
          onCellComplete(result.cell.x, result.cell.y);
        }
      }

      if (playSound) {
        switch (result.type) {
          case "plant":
            playSound("plant");
            break;
          case "harvest":
            playSound("harvest");
            break;
          case "fertilize":
          case "perk":
            playSound("fertilize");
            break;
        }
      }

      if (result.type === "harvest") {
        const harvestResult = result as HarvestActionResult;
        if (harvestResult.rewards?.didLevelUp) {
          onLevelUp?.();
        }

        if (harvestResult.rewards && onHarvestReward) {
          onHarvestReward({
            x: result.cell?.x as number,
            y: result.cell?.y as number,
            exp: harvestResult.rewards.xp,
            amount: harvestResult.rewards.amount,
            cropType: harvestResult.rewards.cropType as CropType,
          });
        }
      }

      await onProcessComplete?.(results);
    },
    onSettled: () => {
      setIsProcessing(false);
      actionQueue.setProcessing(false);
    },
  });

  const actionQueue = useActionQueue(
    async (action) => {
      setIsProcessing(true);
      await processAction(action);
    },
    500 // debounce delay
  );

  const queueAction = useCallback(
    (action: BatchedAction) => {
      console.log("📥 Queueing new action:", action);
      actionQueue.add(action);
      onAddAction?.(action);
    },
    [actionQueue, onAddAction]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      actionQueue.clear();
    };
  }, [actionQueue]);

  return {
    queueAction,
    isProcessing,
    actionQueue,
  };
}
