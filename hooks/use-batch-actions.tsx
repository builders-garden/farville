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
  onProcessComplete?: () => void;
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

  const { mutate: processBatch } = useApiMutation<
    ActionResult[],
    BatchedAction[]
  >({
    url: "/api/batch-actions",
    method: "POST",
    body: (actions) => ({ actions }),
    onMutate: (actions) => {
      console.log("🚀 Starting batch mutation with actions:", actions);
      actions.forEach((action) => {
        onProcessStart?.(action.x, action.y);
      });
    },
    onError: (error) => {
      console.error("❌ Batch mutation failed:", error);
    },
    onSuccess: (results) => {
      console.log("✅ Batch mutation completed with results:", results);
      results.forEach((result: ActionResult) => {
        if (onCellComplete) {
          console.log("📱 Completing cell:", result.cell?.x, result.cell?.y);
          onCellComplete(result.cell?.x as number, result.cell?.y as number);
        }

        if (playSound) {
          console.log("🔊 Playing sound for action type:", result.type);
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
            console.log("🎉 Level up triggered!");
            onLevelUp?.();
          }

          if (harvestResult.rewards && onHarvestReward) {
            console.log(
              "💰 Processing harvest rewards:",
              harvestResult.rewards
            );
            onHarvestReward({
              x: result.cell?.x as number,
              y: result.cell?.y as number,
              exp: harvestResult.rewards.xp,
              amount: harvestResult.rewards.amount,
              cropType: harvestResult.rewards.cropType as CropType,
            });
          }
        }
      });
    },
    onSettled: () => {
      onProcessComplete?.();
      console.log("🏁 Batch processing complete, resetting state");
      setIsProcessing(false);
      actionQueue.setProcessing(false);
    },
  });

  const actionQueue = useActionQueue(
    (actions) => {
      console.log("📤 Processing batch:", actions);
      setIsProcessing(true);
      processBatch(actions);
    },
    1000, // 2 second batch window
    5 // max 5 actions per batch
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
    pendingActions: [], // We could expose the queue length if needed
  };
}
