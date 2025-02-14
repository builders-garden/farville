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
import { ActionType, type CropType, type SeedType } from "../types/game";
import { GameState, useGameState } from "@/hooks/use-game-state";
import { useBuyItem } from "@/hooks/game-actions/use-buy-item";
import { useExpandGrid } from "@/hooks/game-actions/use-expand-grid";
import { useSellItem } from "@/hooks/game-actions/use-sell-item";
import { UserItem } from "@/hooks/use-user-items";
import { GridBulkRequest } from "@/app/api/grid-bulk/route";
import { useGridBulkOperations } from "@/hooks/game-actions/use-grid-bulk-operations";
import { DbGridCell } from "@/supabase/types";
import { GridBulkResult } from "@/app/api/grid-bulk/utils";
import toast from "react-hot-toast";

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
  gridBulkResult?: GridBulkResult;
  // fertilize: (params: {
  //   x: number;
  //   y: number;
  //   setIsLoading: Dispatch<SetStateAction<boolean>>;
  // }) => void;
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
  showStreaks: boolean;
  setShowInventory: (show: boolean) => void;
  setShowMarket: (show: boolean) => void;
  setShowLeaderboard: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowSeedsMenu: (show: boolean) => void;
  setShowQuests: (show: boolean) => void;
  setShowRequests: (show: boolean) => void;
  setShowStreaks: (show: boolean) => void;
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
  const [showStreaks, setShowStreaks] = useState(false);
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

  const [gridBulkResult, setGridBulkResult] = useState<
    GridBulkResult | undefined
  >();
  const [toastIds, setToastIds] = useState<Map<string, string>>(new Map());

  const { mutate: sendGridBulkOperations } = useGridBulkOperations({
    setGridBulkResult,
    refetch,
  });

  const addGridOperation = (operation: GridBulkRequest) => {
    let toastId = toastIds.get(operation.action);

    if (!toastId) {
      toastId = toast.loading(
        operation.action === ActionType.Harvest
          ? "Harvesting..."
          : operation.action === ActionType.Plant
          ? "Planting..."
          : operation.action === ActionType.ApplyPerk
          ? "Boosting..."
          : "Processing..."
      );
      setToastIds((prev) => new Map(prev).set(operation.action, toastId!));
    }

    if (gridBulkOperations) {
      if (operation.action !== gridBulkOperations.action) {
        sendGridBulkOperations({ gridBulkOperations, toastId: toastId || "" });
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
        const toastId = toastIds.get(gridBulkOperations.action);
        sendGridBulkOperations({ gridBulkOperations, toastId: toastId || "" });
        setGridBulkOperations(undefined);
        setToastIds((prev) => {
          const newMap = new Map(prev);
          newMap.delete(gridBulkOperations.action);
          return newMap;
        });
      }, 750);
    }
  }, [gridBulkOperations, sendGridBulkOperations, toastIds]);

  useEffect(() => {
    if (gridBulkResult?.type === ActionType.Harvest) {
      const rewards = gridBulkResult.rewards?.cropsWithRewards;
      if (rewards && state) {
        const updatedItems: Partial<UserItem>[] = [];
        for (const reward of rewards) {
          let crop = state.crops.find(
            (item) => item.item?.slug === reward.crop
          );
          if (!crop) {
            const cropItem = state.items.find(
              (item) => item.slug === reward.crop
            );
            if (cropItem) {
              crop = {
                item: cropItem,
                quantity: 0,
                id: cropItem.id,
                userFid: state.user.fid,
                itemId: cropItem.id,
                createdAt: new Date().toISOString(),
              };
            } else {
              console.error("Crop item not found", reward.crop);
              continue;
            }
          }
          const index = updatedItems.findIndex(
            (item) => item.item?.id === crop?.item?.id
          );
          if (index !== -1) {
            updatedItems[index].quantity! += reward.amount;
          } else {
            updatedItems.push({
              item: {
                ...crop.item,
                category: "crop",
              },
              quantity: crop?.quantity + reward.amount,
              itemId: crop.item.id,
              userFid: state.user.fid,
              createdAt: new Date().toISOString(),
            });
          }
        }
        updateUserItems(updatedItems);
      }
    }
  }, [gridBulkResult]);

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

  useEffect(() => {
    if (!loading) {
      const tutorialComplete =
        localStorage.getItem("tutorialComplete") === "true" ||
        (state?.user?.xp && state?.user?.xp > 0);
      setTutorialComplete(!!tutorialComplete);
    }
  }, [state?.user?.xp, loading]);

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
        gridBulkResult,
        // fertilize: (params) =>
        //   applyPerkMutation({
        //     ...params,
        //     itemSlug: "fertilizer",
        //     setIsLoading: params.setIsLoading,
        //   }),
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
        showStreaks,
        setShowInventory,
        setShowMarket,
        setShowLeaderboard,
        setShowSettings,
        setShowSeedsMenu,
        setShowQuests,
        setShowRequests,
        setShowStreaks,
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
