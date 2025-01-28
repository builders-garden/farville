"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

// Update the OverlayType to be more flexible with parameters
export type OverlayConfig =
  | { type: "welcome" }
  | { type: "requests"; id: number }
  | { type: "tutorial"; step?: number }
  | null;

// Update the context type
interface GameContextType {
  state: GameState;
  selectedSeed: SeedType | null;
  setSelectedSeed: (seed: SeedType | null) => void;
  selectedPerk: UserItem | null;
  setSelectedPerk: (perk: UserItem | null) => void;
  plantSeed: (params: { x: number; y: number; seedType: SeedType }) => void;
  harvestCrop: (params: {
    x: number;
    y: number;
  }) => Promise<HarvestResponse | undefined>;
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
  pendingActions: Set<string>;
  addPendingAction: (actionKey: string) => void;
  removePendingAction: (actionKey: string) => void;
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
  const [pendingActions] = useState<Set<string>>(new Set());

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

  const harvestCrop = (params: { x: number; y: number }) => {
    return new Promise<HarvestResponse | undefined>((resolve) => {
      harvestCropMutation(params, {
        onSuccess: (data) => resolve(data),
        onError: () => resolve(undefined),
      });
    });
  };

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

  const addPendingAction = (actionKey: string) => {
    pendingActions.add(actionKey);
  };

  const removePendingAction = (actionKey: string) => {
    pendingActions.delete(actionKey);
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
        pendingActions,
        addPendingAction,
        removePendingAction,
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
