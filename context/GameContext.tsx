"use client";

import { createContext, useContext, useState } from "react";
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
import { useBoost } from "@/hooks/game-actions/use-boost";

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
  selectedFertilizer: UserItem | null;
  setSelectedFertilizer: (perk: UserItem | null) => void;
  plantSeed: (params: { x: number; y: number; seedType: SeedType }) => void;
  harvestCrop: (params: {
    x: number;
    y: number;
  }) => Promise<HarvestResponse | undefined>;
  fertilize: (params: { x: number; y: number }) => void;
  buyItem: (params: { itemId: number; quantity: number }) => void;
  sellItem: (params: { itemId: number; quantity: number }) => void;
  expandGrid: () => void;
  speedBoost: (params: { x: number; y: number }) => void;
  yieldBoost: (params: { x: number; y: number }) => void;
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
  activeOverlay: OverlayConfig;
  setActiveOverlay: (overlay: OverlayConfig) => void;
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
  const { state, refetch } = useGameState();
  const [selectedSeed, setSelectedSeed] = useState<SeedType | null>(null);
  const [selectedFertilizer, setSelectedFertilizer] = useState<UserItem | null>(
    null
  );
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [activeOverlay, setActiveOverlay] =
    useState<OverlayConfig>(initialOverlay);
  console.log("activeOverlay", activeOverlay);

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
  const { mutate: speedBoost } = useBoost({
    refetchGridCells: refetch.grid,
    refetchUserItems: refetch.userItems,
    isActionInProgress,
    setIsActionInProgress,
    actionType: "speed-boost",
  });
  const { mutate: yieldBoost } = useBoost({
    refetchGridCells: refetch.grid,
    refetchUserItems: refetch.userItems,
    isActionInProgress,
    setIsActionInProgress,
    actionType: "yield-boost",
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
        selectedFertilizer,
        setSelectedFertilizer,
        plantSeed,
        harvestCrop,
        fertilize,
        buyItem,
        sellItem,
        expandGrid,
        speedBoost,
        yieldBoost,
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
        activeOverlay,
        setActiveOverlay,
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
