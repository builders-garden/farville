"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { CropType, SeedType } from "../types/game";
import { useAudio } from "./AudioContext";
import { GameState, useGameState } from "@/hooks/use-game-state";
import { useBuyItem } from "@/hooks/game-actions/use-buy-item";
import { useExpandGrid } from "@/hooks/game-actions/use-expand-grid";
import { useSellItem } from "@/hooks/game-actions/use-sell-item";
import { UserItem } from "@/hooks/use-user-items";
import {
  ActionResult,
  HarvestActionResult,
} from "@/app/api/batch-actions/route";
import { useApiMutation } from "@/hooks/use-api-mutation";

// Update the OverlayType to be more flexible with parameters
export type OverlayConfig =
  | { type: "welcome" }
  | { type: "requests"; id: number }
  | { type: "tutorial"; step?: number }
  | null;

// Simplify PendingCell type
interface PendingCell {
  key: string;
  timestamp: number;
}

// Add these types at the top
type ActionType = "plant" | "harvest" | "fertilize" | "perk";

interface BatchedAction {
  type: ActionType;
  x: number;
  y: number;
  params?: {
    seedType?: SeedType;
    itemSlug?: string;
    itemId?: number;
  }; // Additional params like seedType, itemId etc
}

// Update the context type
interface GameContextType {
  state: GameState;
  selectedSeed: SeedType | null;
  setSelectedSeed: (seed: SeedType | null) => void;
  selectedPerk: UserItem | null;
  setSelectedPerk: (perk: UserItem | null) => void;
  plantSeed: (params: { x: number; y: number; seedType: SeedType }) => void;
  harvestCrop: (params: { x: number; y: number }) => void;
  fertilize: (params: { x: number; y: number }) => void;
  applyPerk: (params: {
    x: number;
    y: number;
    itemSlug: string;
    itemId: number;
  }) => void;
  buyItem: (params: { itemId: number; quantity: number }) => void;
  sellItem: (params: { itemId: number; quantity: number }) => void;
  expandGrid: () => void;
  refetchState: () => Promise<void>;
  refetchUser: () => Promise<void>;
  refetchClaimableQuests: () => Promise<void>;
  showInventory: boolean;
  showMarket: boolean;
  showLeaderboard: boolean;
  showSettings: boolean;
  showSeedsMenu: boolean;
  showQuests: boolean;
  showRequests: boolean;
  setShowInventory: (show: boolean) => void;
  setShowMarket: (show: boolean) => void;
  setShowLeaderboard: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowSeedsMenu: (show: boolean) => void;
  setShowQuests: (show: boolean) => void;
  setShowRequests: (show: boolean) => void;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  activeOverlay: OverlayConfig;
  setActiveOverlay: (overlay: OverlayConfig) => void;
  tutorialComplete: boolean;
  setTutorialComplete: (complete: boolean) => void;
  pendingCells: Map<string, PendingCell>;
  addPendingCell: (x: number, y: number) => void;
  removePendingCell: (x: number, y: number) => void;
  showLevelUpConfetti: boolean;
  floatingNumbers: {
    x: number; // screen x
    y: number; // screen y
    gridX: number; // grid x
    gridY: number; // grid y
    exp: number;
    amount: number;
    cropType: CropType;
  } | null;
  remainingUses: number;
  setRemainingUses: (uses: number) => void;
}

export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({
  children,
  initialOverlay = null,
}: {
  children: React.ReactNode;
  initialOverlay?: OverlayConfig;
}) {
  const [showInventory, setShowInventory] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showSeedsMenu, setShowSeedsMenu] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const { state, refetch, loading } = useGameState();
  const [selectedSeed, setSelectedSeed] = useState<SeedType | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<UserItem | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [activeOverlay, setActiveOverlay] =
    useState<OverlayConfig>(initialOverlay);
  const [tutorialComplete, setTutorialComplete] = useState(true);
  const [pendingCells, setPendingCells] = useState<Map<string, PendingCell>>(
    new Map()
  );
  const [pendingActions, setPendingActions] = useState<BatchedAction[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<{
    x: number; // screen x
    y: number; // screen y
    gridX: number; // grid x
    gridY: number; // grid y
    exp: number;
    amount: number;
    cropType: CropType;
  } | null>(null);
  const { playSound } = useAudio();
  const [remainingUses, setRemainingUses] = useState<number>(0);

  useEffect(() => {
    if (!loading) {
      const tutorialComplete =
        localStorage.getItem("tutorialComplete") === "true" ||
        (state?.user.xp && state?.user.xp > 0);
      setTutorialComplete(!!tutorialComplete);
    }
  }, [state?.user.xp, loading]);

  const addPendingCell = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    setPendingCells((prev) => {
      const next = new Map(prev);
      next.set(key, { key, timestamp: Date.now() });
      return next;
    });
  }, []);

  const removePendingCell = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    setPendingCells((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const { mutate: processBatch } = useApiMutation<ActionResult[]>({
    url: "/api/batch-actions",
    method: "POST",
    body: (actions) => {
      console.log("[processBatch] Sending actions:", actions);
      return { actions };
    },
    onSuccess: (results) => {
      console.log("[processBatch] Received results:", results);

      // Track if we need to refetch user/items
      let shouldRefetchUser = false;
      let shouldRefetchItems = false;

      results.forEach((result: ActionResult, index: number) => {
        const action = pendingActions[index];
        console.log(`[processBatch] Processing result ${index}:`, {
          result,
          action,
        });

        removePendingCell(result.cell?.x as number, result.cell?.y as number);

        // Play appropriate sound based on action type
        switch (result.type) {
          case "plant":
            playSound("plant");
            shouldRefetchItems = true;
            break;
          case "harvest":
            playSound("harvest");
            shouldRefetchUser = true;
            shouldRefetchItems = true;
            break;
          case "fertilize":
            playSound("fertilize");
            shouldRefetchItems = true;
            break;
          case "perk":
            playSound("fertilize"); // Using fertilize sound for perks
            shouldRefetchItems = true;
            break;
        }

        if (
          result.type === "harvest" &&
          (result as HarvestActionResult).rewards
        ) {
          const harvestResult = result as HarvestActionResult;
          console.log(
            "[processBatch] Processing harvest result:",
            harvestResult
          );

          if (harvestResult.rewards?.didLevelUp) {
            console.log("[processBatch] Player leveled up!");
            setShowLevelUpConfetti(true);
            playSound("levelUp");
            setTimeout(() => {
              setShowLevelUpConfetti(false);
            }, 1500);
          }

          const cellElement = document.querySelector(
            `[data-x="${result.cell?.x}"][data-y="${result.cell?.y}"]`
          );
          if (cellElement && harvestResult.rewards) {
            console.log("[processBatch] Setting floating numbers for cell:", {
              x: result.cell?.x,
              y: result.cell?.y,
            });
            const rect = cellElement.getBoundingClientRect();
            setFloatingNumbers({
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              gridX: result.cell?.x as number,
              gridY: result.cell?.y as number,
              exp: harvestResult.rewards.xp,
              amount: harvestResult.rewards.amount,
              cropType: harvestResult.rewards.cropType as CropType,
            });

            console.log(
              "[processBatch] Floating numbers set:",
              floatingNumbers
            );

            setTimeout(() => {
              setFloatingNumbers(null);
            }, 1500);
          }
        }
      });

      console.log(
        "[processBatch] Finished processing all results, refetching data"
      );

      // Perform all necessary refetches
      if (shouldRefetchUser) {
        refetch.user();
      }
      if (shouldRefetchItems) {
        refetch.userItems();
      }
      refetch.grid();
    },
  });

  const processBatchedActions = useCallback(() => {
    // Get actions and clear queue atomically
    let actionsToProcess: BatchedAction[] = [];

    setPendingActions((currentPendingActions) => {
      if (currentPendingActions.length === 0) {
        console.log("[processBatchedActions] No pending actions, returning");
        return currentPendingActions;
      }

      console.log("[processBatchedActions] Processing batch");
      actionsToProcess = [...currentPendingActions];
      return []; // Clear the queue immediately
    });

    // Only process if we actually got actions
    if (actionsToProcess.length > 0) {
      setIsActionInProgress(true);
      try {
        console.log(
          "[processBatchedActions] Calling processBatch with actions:",
          actionsToProcess
        );
        processBatch(actionsToProcess);
      } catch (error) {
        console.error(
          "[processBatchedActions] Error processing batched actions:",
          error
        );
      } finally {
        setIsActionInProgress(false);
      }
    }
  }, [processBatch]);

  const queueAction = useCallback(
    (action: BatchedAction) => {
      console.log(
        `[queueAction] Adding action: ${action.type} at (${action.x},${action.y})`
      );
      addPendingCell(action.x, action.y);

      setPendingActions((prev) => {
        const newActions = [...prev, action];
        console.log("[queueAction] New pending actions:", newActions);

        // If we already have a timeout set, just add to queue
        if (batchTimeoutRef.current) {
          console.log("[queueAction] Timeout already exists, adding to queue");
          return newActions;
        }

        // If this is the first action, set the timeout
        console.log("[queueAction] Setting new timeout");
        batchTimeoutRef.current = setTimeout(() => {
          console.log("[queueAction] Processing batch after timeout");
          batchTimeoutRef.current = null; // Clear the ref
          processBatchedActions();
        }, 1000);

        return newActions;
      });
    },
    [addPendingCell, processBatchedActions]
  );

  // Update the action handlers to use queueAction
  const plantSeed = useCallback(
    (params: { x: number; y: number; seedType: SeedType }) => {
      queueAction({
        type: "plant",
        x: params.x,
        y: params.y,
        params: { seedType: params.seedType },
      });
      setRemainingUses((prev) => Math.max(0, prev - 1));
      if (remainingUses <= 1) {
        setSelectedSeed(null);
      }
    },
    [queueAction, remainingUses]
  );

  const harvestCrop = useCallback(
    (params: { x: number; y: number }) => {
      queueAction({
        type: "harvest",
        x: params.x,
        y: params.y,
      });
    },
    [queueAction]
  );

  const fertilize = useCallback(
    (params: { x: number; y: number }) => {
      queueAction({
        type: "fertilize",
        x: params.x,
        y: params.y,
      });
    },
    [queueAction]
  );

  const applyPerk = useCallback(
    (params: { x: number; y: number; itemSlug: string; itemId: number }) => {
      queueAction({
        type: "perk",
        x: params.x,
        y: params.y,
        params: { itemSlug: params.itemSlug, itemId: params.itemId },
      });
      setRemainingUses((prev) => Math.max(0, prev - 1));
      if (remainingUses <= 1) {
        setSelectedPerk(null);
      }
    },
    [queueAction, remainingUses]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  const { mutate: buyItem } = useBuyItem({
    refetchUser: refetch.user,
    refetchUserItems: refetch.userItems,
    isActionInProgress,
    setIsActionInProgress,
  });
  const { mutate: sellItem } = useSellItem({
    refetchUser: refetch.user,
    refetchUserItems: refetch.userItems,
    isActionInProgress,
    setIsActionInProgress,
  });
  const { mutate: expandGrid } = useExpandGrid({
    isActionInProgress,
    setIsActionInProgress,
    refetchGridCells: refetch.grid,
    refetchUser: refetch.user,
  });

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <GameContext.Provider
      value={{
        state,
        selectedSeed,
        setSelectedSeed,
        selectedPerk: selectedPerk,
        setSelectedPerk: setSelectedPerk,
        plantSeed,
        harvestCrop,
        fertilize,
        applyPerk,
        buyItem,
        sellItem,
        expandGrid,
        refetchState: refetch.all,
        refetchUser: refetch.user,
        refetchClaimableQuests: refetch.claimableQuests,
        showInventory,
        showMarket,
        showLeaderboard,
        showSettings,
        showSeedsMenu,
        showQuests,
        showRequests,
        setShowInventory,
        setShowMarket,
        setShowLeaderboard,
        setShowSettings,
        setShowSeedsMenu,
        setShowQuests,
        setShowRequests,
        isActionInProgress,
        setIsActionInProgress,
        activeOverlay,
        setActiveOverlay,
        tutorialComplete,
        setTutorialComplete,
        pendingCells,
        addPendingCell,
        removePendingCell,
        showLevelUpConfetti,
        floatingNumbers,
        remainingUses,
        setRemainingUses,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
