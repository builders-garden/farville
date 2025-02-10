"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CropType, SeedType } from "../types/game";
import { GameState, useGameState } from "@/hooks/use-game-state";
import { useBuyItem } from "@/hooks/game-actions/use-buy-item";
import { useExpandGrid } from "@/hooks/game-actions/use-expand-grid";
import { useSellItem } from "@/hooks/game-actions/use-sell-item";
import { UserItem } from "@/hooks/use-user-items";
import { usePlantSeed } from "@/hooks/game-actions/use-plant-seed";
import { useHarvestCrop } from "@/hooks/game-actions/use-harvest-crop";
import { useApplyPerk } from "@/hooks/game-actions/use-apply-perk";
import { GridBulkRequest } from "@/app/api/grid-bulk/route";
import { useGridBulkOperations } from "@/hooks/game-actions/use-grid-bulk-operations";
import { DbGridCell } from "@/supabase/types";

// Update the OverlayType to be more flexible with parameters
export type OverlayConfig =
  | { type: "welcome" }
  | { type: "requests"; id: number }
  | { type: "tutorial"; step?: number }
  | null;

// Update the floatingNumbers type to be an array
export interface FloatingNumberData {
  x: number; // screen x
  y: number; // screen y
  gridX: number; // grid x
  gridY: number; // grid y
  exp: number;
  amount?: number;
  cropType: CropType;
  id: string;
}

// Update the context type
interface GameContextType {
  state: GameState;
  selectedSeed: SeedType | null;
  setSelectedSeed: (seed: SeedType | null) => void;
  selectedPerk: UserItem | null;
  setSelectedPerk: (perk: UserItem | null) => void;
  addGridOperation: (operation: GridBulkRequest) => void;
  plantSeed: (params: {
    x: number;
    y: number;
    seedType: SeedType;
    item: UserItem;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
  }) => void;
  harvestCrop: (params: {
    x: number;
    y: number;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
  }) => void;
  fertilize: (params: {
    x: number;
    y: number;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
  }) => void;
  applyPerk: (params: {
    x: number;
    y: number;
    itemSlug: string;
    item: UserItem;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
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
  showLevelUpConfetti: boolean;
  setShowLevelUpConfetti: Dispatch<SetStateAction<boolean>>;
  floatingNumbers: FloatingNumberData[];
  setFloatingNumbers: Dispatch<SetStateAction<FloatingNumberData[]>>;
  remainingUses: number;
  setRemainingUses: (uses: number) => void;
  updateGridCells: (updatedCells: Partial<DbGridCell>[]) => void;
  updateUserItems: (updatedItems: Partial<UserItem>[]) => void;
  updateUser: (newParams: {
    xp?: number;
    level?: number;
    coins?: number;
  }) => void;
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
  const {
    state,
    refetch,
    loading,
    updateGridCells,
    updateUserItems,
    updateUser,
  } = useGameState();
  const [selectedSeed, setSelectedSeed] = useState<SeedType | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<UserItem | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [activeOverlay, setActiveOverlay] =
    useState<OverlayConfig>(initialOverlay);
  const [tutorialComplete, setTutorialComplete] = useState(true);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumberData[]>(
    []
  );
  const [remainingUses, setRemainingUses] = useState<number>(0);

  const [gridBulkOperations, setGridBulkOperations] =
    useState<GridBulkRequest>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: sendGridBulkOperations } = useGridBulkOperations();

  const addGridOperation = (operation: GridBulkRequest) => {
    if (gridBulkOperations) {
      if (operation.action !== gridBulkOperations.action) {
        sendGridBulkOperations(gridBulkOperations);
        setGridBulkOperations(operation);
      } else {
        setGridBulkOperations((prev) => {
          if (!prev) return operation;
          return {
            ...prev,
            cells: [...prev.cells, ...operation.cells],
          };
        });
      }
    } else {
      setGridBulkOperations(operation);
    }
  };

  useEffect(() => {
    if (gridBulkOperations) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        sendGridBulkOperations(gridBulkOperations);
        setGridBulkOperations(undefined);
      }, 500);
    }
  }, [gridBulkOperations, sendGridBulkOperations]);

  const [isGridDoingOperations, setIsGridDoingOperations] = useState(false);
  const [operationsCounter, setOperationsCounter] = useState(0);
  const prevIsGridDoingOperationsRef = useRef(isGridDoingOperations);

  useEffect(() => {
    if (operationsCounter === 0) {
      setIsGridDoingOperations(false);
    } else {
      setIsGridDoingOperations(true);
    }
  }, [operationsCounter]);

  const handleIncreaseOperationsCounter = () => {
    setOperationsCounter((prev) => prev + 1);
  };

  const handleDecreaseOperationsCounter = () => {
    setOperationsCounter((prev) => prev - 1);
  };

  const handleOperationCounter = {
    increase: handleIncreaseOperationsCounter,
    decrease: handleDecreaseOperationsCounter,
  };

  useEffect(() => {
    const prevIsGridDoingOperations = prevIsGridDoingOperationsRef.current;
    if (prevIsGridDoingOperations && !isGridDoingOperations) {
      refetch.grid();
      refetch.userItems();
      refetch.user();
    }
    prevIsGridDoingOperationsRef.current = isGridDoingOperations;
  }, [isGridDoingOperations, refetch]);

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
    refetchGridCells: refetch.grid,
    refetchUser: refetch.user,
    isActionInProgress,
    setIsActionInProgress,
  });

  const { mutate: plantSeedMutation } = usePlantSeed({
    updateGridCells,
    updateUserItems,
    handleOperationCounter,
  });

  const { mutate: harvestCropMutation } = useHarvestCrop({
    updateGridCells,
    setFloatingNumbers,
    setShowLevelUpConfetti,
    handleOperationCounter,
  });

  const { mutate: applyPerkMutation } = useApplyPerk({
    updateGridCells,
    updateUserItems,
    handleOperationCounter,
  });

  useEffect(() => {
    if (!loading) {
      const tutorialComplete =
        localStorage.getItem("tutorialComplete") === "true" ||
        (state?.user.xp && state?.user.xp > 0);
      setTutorialComplete(!!tutorialComplete);
    }
  }, [state?.user.xp, loading]);

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
        selectedPerk,
        setSelectedPerk,
        addGridOperation,
        plantSeed: plantSeedMutation,
        harvestCrop: harvestCropMutation,
        fertilize: (params) =>
          applyPerkMutation({
            ...params,
            itemSlug: "fertilizer",
            setIsLoading: params.setIsLoading,
          }),
        applyPerk: applyPerkMutation,
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
        showLevelUpConfetti,
        setShowLevelUpConfetti,
        floatingNumbers,
        setFloatingNumbers,
        remainingUses,
        setRemainingUses,
        updateGridCells,
        updateUserItems,
        updateUser,
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
