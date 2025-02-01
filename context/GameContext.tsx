"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { CropType, SeedType } from "../types/game";
import { useAudio } from "./AudioContext";
import { GameState, useGameState } from "@/hooks/use-game-state";
import { useBuyItem } from "@/hooks/game-actions/use-buy-item";
import { useExpandGrid } from "@/hooks/game-actions/use-expand-grid";
import { useSellItem } from "@/hooks/game-actions/use-sell-item";
import { UserItem } from "@/hooks/use-user-items";
import { useBatchActions } from "@/hooks/use-batch-actions";

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

// Update the floatingNumbers type to be an array
interface FloatingNumberData {
  x: number; // screen x
  y: number; // screen y
  gridX: number; // grid x
  gridY: number; // grid y
  exp: number;
  amount: number;
  cropType: CropType;
  id: string; // Add unique ID for managing multiple numbers
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
  floatingNumbers: FloatingNumberData[];
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
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumberData[]>(
    []
  );
  const { playSound } = useAudio();
  const [remainingUses, setRemainingUses] = useState<number>(0);

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

  const { queueAction, isProcessing } = useBatchActions({
    onProcessComplete: async () => {
      try {
        // Try multiple times to refresh the grid if needed
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          console.log(
            `Attempting grid refresh (attempt ${attempts + 1}/${maxAttempts})`
          );
          await refetch.grid();

          // Verify the grid state is correct
          // If not, try again after a short delay
          if (verifyGridState()) {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 200));
          attempts++;
        }

        // Refresh other states after grid is confirmed updated
        await Promise.all([refetch.user(), refetch.userItems()]).catch(
          console.error
        );
      } catch (error) {
        console.error("Failed to refresh grid state:", error);
      }
    },
    onCellComplete: (x, y) => {
      removePendingCell(x, y);
    },
    onLevelUp: () => {
      setShowLevelUpConfetti(true);
      playSound("levelUp");
      setTimeout(() => setShowLevelUpConfetti(false), 1500);
    },
    onHarvestReward: ({ x, y, exp, amount, cropType }) => {
      const cellElement = document.querySelector(
        `[data-x="${x}"][data-y="${y}"]`
      );
      if (cellElement) {
        const rect = cellElement.getBoundingClientRect();
        const newFloatingNumber = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          gridX: x,
          gridY: y,
          exp,
          amount,
          cropType,
          id: `${Date.now()}-${x}-${y}`, // Add unique ID
        };

        setFloatingNumbers((prev) => [...prev, newFloatingNumber]);

        // Remove this specific floating number after animation
        setTimeout(() => {
          setFloatingNumbers((prev) =>
            prev.filter((num) => num.id !== newFloatingNumber.id)
          );
        }, 1500);
      }
    },
    playSound,
  });

  useEffect(() => {
    if (!loading) {
      const tutorialComplete =
        localStorage.getItem("tutorialComplete") === "true" ||
        (state?.user.xp && state?.user.xp > 0);
      setTutorialComplete(!!tutorialComplete);
    }
  }, [state?.user.xp, loading]);

  // Update isActionInProgress to use isProcessing from useBatchActions
  useEffect(() => {
    setIsActionInProgress(isProcessing);
  }, [isProcessing]);

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

  // Helper function to verify grid state
  const verifyGridState = () => {
    // Add logic to verify the grid state is as expected
    // For example, check that cells marked as pending are properly updated
    return true; // Implement your verification logic
  };

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
        plantSeed: (params) =>
          queueAction({
            type: "plant",
            x: params.x,
            y: params.y,
            params: { seedType: params.seedType },
          }),
        harvestCrop: (params) =>
          queueAction({
            type: "harvest",
            x: params.x,
            y: params.y,
          }),
        fertilize: (params) =>
          queueAction({
            type: "fertilize",
            x: params.x,
            y: params.y,
          }),
        applyPerk: (params) =>
          queueAction({
            type: "perk",
            x: params.x,
            y: params.y,
            params: { itemSlug: params.itemSlug, itemId: params.itemId },
          }),
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
