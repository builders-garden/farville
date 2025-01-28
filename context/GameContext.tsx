"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import type { HarvestResponse, SeedType } from "../types/game";
//import { useAudio } from "./AudioContext";
import { GameState, useGameState } from "@/hooks/use-game-state";
import { usePlantSeed } from "@/hooks/game-actions/use-plant-seed";
import { useHarvestCrop } from "@/hooks/game-actions/use-harvest-crop";
import { useFertilize } from "@/hooks/game-actions/use-fertilize";
import { useBuyItem } from "@/hooks/game-actions/use-buy-item";
import { useExpandGrid } from "@/hooks/game-actions/use-expand-grid";
import { useSellItem } from "@/hooks/game-actions/use-sell-item";
import { UserItem } from "@/hooks/use-user-items";
import { useApplyPerk } from "@/hooks/game-actions/use-apply-perk";
import { debounce } from "lodash";

// Update the OverlayType to be more flexible with parameters
export type OverlayConfig =
  | { type: "welcome" }
  | { type: "requests"; id: number }
  | { type: "tutorial"; step?: number }
  | null;

// Add at the top after imports
interface PendingCell {
  key: string;
  timestamp: number;
  removeTimeout?: NodeJS.Timeout;
}

// Update the context type
interface GameContextType {
  state: GameState;
  selectedSeed: SeedType | null;
  setSelectedSeed: (seed: SeedType | null) => void;
  selectedPerk: UserItem | null;
  setSelectedPerk: (perk: UserItem | null) => void;
  plantSeed: (params: { x: number; y: number; seedType: SeedType }) => void;
  harvestCrop: (params: { x: number; y: number }) => Promise<HarvestResponse>;
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
}

export const GameContext = createContext<GameContextType | null>(null);

const debouncedCallbacks = new Map<string, ReturnType<typeof debounce>>();

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

  useEffect(() => {
    if (!loading) {
      const tutorialComplete =
        localStorage.getItem("tutorialComplete") === "true" ||
        (state?.user.xp && state?.user.xp > 0);
      setTutorialComplete(!!tutorialComplete);
    }
  }, [state?.user.xp, loading]);

  const { mutate: plantSeed } = usePlantSeed({
    refetchGridCells: refetch.grid,
    refetchUserItems: refetch.userItems,
    setIsActionInProgress,
    isActionInProgress,
    onSuccess: () => {
      const seed = state?.seeds.find((seed) => seed.item.slug === selectedSeed);
      if (!seed || seed?.quantity === 1 || seed?.quantity === 0) {
        setSelectedSeed(null);
      }
    },
  });
  const { mutate: harvestCropMutation } = useHarvestCrop({
    refetchGridCells: refetch.grid,
    refetchUserItems: refetch.userItems,
    refetchUser: refetch.user,
    isActionInProgress,
    setIsActionInProgress,
  });

  const addPendingCell = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    console.log("Adding pending cell:", key);
    setPendingCells((prev) => {
      const next = new Map(prev);
      next.set(key, { key, timestamp: Date.now() });
      console.log("New pending cells:", [...next.values()]);
      return next;
    });
  }, []);

  const processRemovalQueue = useCallback(
    (cells: Map<string, PendingCell>, currentKey: string) => {
      // First, remove the current cell immediately
      setPendingCells((prev) => {
        const next = new Map(prev);
        next.delete(currentKey);
        return next;
      });

      // Then process the remaining cells in order
      const remainingCells = [...cells.values()]
        .filter((cell) => cell.key !== currentKey)
        .sort((a, b) => a.timestamp - b.timestamp);

      remainingCells.forEach((cell, index) => {
        if (!cell.removeTimeout) {
          cell.removeTimeout = setTimeout(() => {
            setPendingCells((prev) => {
              const next = new Map(prev);
              next.delete(cell.key);
              console.log(
                "Removed cell from queue:",
                cell.key,
                "Remaining:",
                [...next.values()].map((c) => c.key)
              );
              return next;
            });
          }, index * 100); // Stagger remaining removals by 100ms
        }
      });
    },
    []
  );

  const removePendingCell = useCallback(
    (x: number, y: number) => {
      const key = `${x},${y}`;
      console.log("Queueing cell for removal:", key);
      setPendingCells((prev) => {
        const next = new Map(prev);
        const cell = next.get(key);
        if (cell) {
          processRemovalQueue(next, key);
        }
        return next;
      });
    },
    [processRemovalQueue]
  );

  useEffect(() => {
    return () => {
      pendingCells.forEach((cell) => {
        if (cell.removeTimeout) {
          clearTimeout(cell.removeTimeout);
        }
      });
    };
  }, [pendingCells]);

  const clearDebouncedCallback = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    const debouncedFn = debouncedCallbacks.get(key);
    if (debouncedFn) {
      debouncedFn.cancel();
      debouncedCallbacks.delete(key);
    }
  }, []);

  const resetPendingCells = useCallback(() => {
    setPendingCells(new Map());
    // Also clear any existing timeouts
    pendingCells.forEach((cell) => {
      if (cell.removeTimeout) {
        clearTimeout(cell.removeTimeout);
      }
    });
  }, [pendingCells]);

  const debouncedHarvestCrop = useMemo(
    () =>
      (params: { x: number; y: number }): Promise<HarvestResponse> => {
        const key = `${params.x},${params.y}`;
        clearDebouncedCallback(params.x, params.y);
        addPendingCell(params.x, params.y);

        return new Promise((resolve, reject) => {
          const debouncedFn = debounce(() => {
            harvestCropMutation(params, {
              onSuccess: (response) => {
                resolve(response);
              },
              onError: (error) => {
                console.error("Error harvesting crop:", error);
                reject(error);
              },
              onSettled: () => {
                resetPendingCells();
                debouncedCallbacks.delete(key);
              },
            });
          }, 300);

          debouncedCallbacks.set(key, debouncedFn);
          debouncedFn();
        });
      },
    [
      harvestCropMutation,
      addPendingCell,
      resetPendingCells,
      clearDebouncedCallback,
    ]
  );

  const debouncedPlantSeed = useMemo(
    () =>
      (params: { x: number; y: number; seedType: SeedType }): Promise<void> => {
        const key = `${params.x},${params.y}`;
        clearDebouncedCallback(params.x, params.y);
        addPendingCell(params.x, params.y);

        return new Promise((resolve) => {
          const debouncedFn = debounce(() => {
            plantSeed(params, {
              onSuccess: () => {
                const seed = state?.seeds.find(
                  (seed) => seed.item.slug === params.seedType
                );
                if (!seed || seed?.quantity === 1 || seed?.quantity === 0) {
                  setSelectedSeed(null);
                }
                resolve();
              },
              onError: (error) => {
                console.error("Error planting seed:", error);
                resolve();
              },
              onSettled: () => {
                resetPendingCells();
                debouncedCallbacks.delete(key);
              },
            });
          }, 300);

          debouncedCallbacks.set(key, debouncedFn);
          debouncedFn();
        });
      },
    [
      plantSeed,
      addPendingCell,
      resetPendingCells,
      state?.seeds,
      setSelectedSeed,
      clearDebouncedCallback,
    ]
  );

  const { mutate: fertilize } = useFertilize({
    refetchGridCells: refetch.grid,
    refetchUserItems: refetch.userItems,
    isActionInProgress,
    setIsActionInProgress,
  });
  const { mutate: applyPerk } = useApplyPerk({
    refetchGridCells: refetch.grid,
    refetchUserItems: refetch.userItems,
    isActionInProgress,
    setIsActionInProgress,
  });
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

  const debouncedFertilize = useMemo(
    () =>
      (params: { x: number; y: number }): Promise<void> => {
        const key = `${params.x},${params.y}`;
        clearDebouncedCallback(params.x, params.y);
        addPendingCell(params.x, params.y);

        return new Promise((resolve) => {
          const debouncedFn = debounce(() => {
            fertilize(params, {
              onSuccess: () => {
                resolve();
              },
              onError: (error) => {
                console.error("Error fertilizing:", error);
                resolve();
              },
              onSettled: () => {
                resetPendingCells();
                debouncedCallbacks.delete(key);
              },
            });
          }, 300);

          debouncedCallbacks.set(key, debouncedFn);
          debouncedFn();
        });
      },
    [fertilize, addPendingCell, resetPendingCells, clearDebouncedCallback]
  );

  const debouncedApplyPerk = useMemo(
    () =>
      (params: {
        x: number;
        y: number;
        itemSlug: string;
        itemId: number;
      }): Promise<void> => {
        const key = `${params.x},${params.y}`;
        clearDebouncedCallback(params.x, params.y);
        addPendingCell(params.x, params.y);

        return new Promise((resolve) => {
          const debouncedFn = debounce(() => {
            applyPerk(params, {
              onSuccess: () => {
                resolve();
              },
              onError: (error) => {
                console.error("Error applying perk:", error);
                resolve();
              },
              onSettled: () => {
                resetPendingCells();
                debouncedCallbacks.delete(key);
              },
            });
          }, 300);

          debouncedCallbacks.set(key, debouncedFn);
          debouncedFn();
        });
      },
    [applyPerk, addPendingCell, resetPendingCells, clearDebouncedCallback]
  );

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
        plantSeed: debouncedPlantSeed,
        harvestCrop: debouncedHarvestCrop,
        fertilize: debouncedFertilize,
        applyPerk: debouncedApplyPerk,
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
