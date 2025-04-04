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
import {
  ActionType,
  CollectibleStatus,
  type CropType,
  type SeedType,
} from "../types/game";
import { GameState, useGameState } from "@/hooks/use-game-state";
import { useBuyItem } from "@/hooks/game-actions/use-buy-item";
import { useExpandGrid } from "@/hooks/game-actions/use-expand-grid";
import { useSellItem } from "@/hooks/game-actions/use-sell-item";
import { UserItem } from "@/hooks/use-user-items";
import { GridBulkRequest } from "@/app/api/grid-bulk/route";
import { useGridBulkOperations } from "@/hooks/game-actions/use-grid-bulk-operations";
import { DbGridCell, DbUserHarvestedCrop } from "@/supabase/types";
import { GridBulkResult } from "@/app/api/grid-bulk/utils";
import toast from "react-hot-toast";
import { useClaimReward } from "@/hooks/game-actions/use-claim-reward";
import { useUpdateUserStreaks } from "@/hooks/use-user-streaks";

// Update the OverlayType to be more flexible with parameters
export type OverlayConfig =
  | { type: "welcome" }
  | { type: "requests"; id: number }
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
  loading: boolean;
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
  refetchUserItems: () => Promise<void>;
  showInventory: boolean;
  showMarket: boolean;
  showLeaderboard: boolean;
  showSettings: boolean;
  showSeedsMenu: boolean;
  showQuests: boolean;
  showTimeline: boolean;
  showRequests: boolean;
  showStreaks: boolean;
  showProfile: boolean;
  setShowInventory: (show: boolean) => void;
  setShowMarket: (show: boolean) => void;
  setShowLeaderboard: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowSeedsMenu: (show: boolean) => void;
  setShowQuests: (show: boolean) => void;
  setShowTimeline: (show: boolean) => void;
  setShowRequests: (show: boolean) => void;
  setShowStreaks: (show: boolean) => void;
  setShowProfile: (show: boolean) => void;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  activeOverlay: OverlayConfig;
  setActiveOverlay: (overlay: OverlayConfig) => void;
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
    mintedOG?: boolean;
  }) => void;
  claimRewards: (variables: { streakId: number }) => void;
  updateUserHarvestedCrops: (
    updatedUserHarvestedCrops: DbUserHarvestedCrop[]
  ) => void;
  showHarvestedNewGoldCrops: boolean;
  setShowHarvestedNewGoldCrops: Dispatch<SetStateAction<boolean>>;
  showAchievedNewBadges: boolean;
  setShowAchievedNewBadges: Dispatch<SetStateAction<boolean>>;
  showMintOGBadge: boolean;
  setShowMintOGBadge: Dispatch<SetStateAction<boolean>>;
  showMintCollectible: boolean;
  setShowMintCollectible: Dispatch<SetStateAction<boolean>>;
  newGoldCropsFound: string[];
  setNewGoldCropsFound: Dispatch<SetStateAction<string[]>>;
  updateUserWeeklyStats: (weeklyStats: {
    currentScore: number;
    lastScore?: number;
    league?: number;
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
  const [showTimeline, setShowTimeline] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMintOGBadge, setShowMintOGBadge] = useState(false);
  const [showMintCollectible, setShowMintCollectible] = useState(false);
  const [isLoadingMintCollectible, setIsLoadingMintCollectible] =
    useState(true);
  const {
    state,
    refetch,
    updateGridCells,
    updateUserItems,
    updateUser,
    updateUserHarvestedCrops,
    updateUserWeeklyStats,
  } = useGameState();
  const [selectedSeed, setSelectedSeed] = useState<SeedType | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<UserItem | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [activeOverlay, setActiveOverlay] =
    useState<OverlayConfig>(initialOverlay);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumberData[]>(
    []
  );
  const [showHarvestedNewGoldCrops, setShowHarvestedNewGoldCrops] =
    useState(false);
  const [showAchievedNewBadges, setShowAchievedNewBadges] = useState(false);
  const [remainingUses, setRemainingUses] = useState<number>(0);

  const [gridBulkOperations, setGridBulkOperations] =
    useState<GridBulkRequest>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [gridBulkResult, setGridBulkResult] = useState<
    GridBulkResult | undefined
  >();
  const [toastIds, setToastIds] = useState<Map<string, string>>(new Map());
  const [newGoldCropsFound, setNewGoldCropsFound] = useState<string[]>([]);

  useEffect(() => {
    if (state.collectibles.length > 0) {
      const collectible = state.collectibles.find(
        (collectible) => collectible.id === 1
      );
      if (
        !collectible?.userHasCollectibles ||
        collectible?.userHasCollectibles?.status !== CollectibleStatus.Minted
      ) {
        setShowMintCollectible(true);
      }
      setIsLoadingMintCollectible(false);
    }
  }, [state.collectibles]);

  const { mutate: updateUserStreaks } = useUpdateUserStreaks({
    refetchStreaks: refetch.streaks,
    refetchUserItems: refetch.userItems,
    refetchFrosts: refetch.frosts,
  });

  const updateUserStreaksOnFirstDailyAction = () => {
    if (state.streakUpdated) return;
    updateUserStreaks({});
  };

  const { mutate: sendGridBulkOperations } = useGridBulkOperations({
    setGridBulkResult,
    refetch,
    updateStreaks: updateUserStreaksOnFirstDailyAction,
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
          : operation.action === ActionType.Fertilize
          ? "Fertilizing..."
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

  const updateUserItemsStateFromReward = (
    rewards: {
      crop: string;
      amount: number;
    }[],
    state: GameState
  ) => {
    const updatedItems: Partial<UserItem>[] = [];
    for (const reward of rewards) {
      let crop = state.crops.find((item) => item.item?.slug === reward.crop);
      if (!crop) {
        const cropItem = state.items.find((item) => item.slug === reward.crop);
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
  };

  const updateUserHarvestedCropsFromReward = (
    rewards: {
      crop: string;
      amount: number;
    }[],
    state: GameState
  ) => {
    const updatedUserHarvestedCrops: DbUserHarvestedCrop[] = [];
    for (const reward of rewards) {
      let userHarvestedCropSummary = state.harvestedCropsSummary.find(
        (item) => item.crop === reward.crop
      );
      if (!userHarvestedCropSummary) {
        userHarvestedCropSummary = {
          fid: state.user.fid,
          crop: reward.crop,
          quantity: 0,
          createdAt: new Date().toISOString(),
        };
      }
      const updatedUserHarvestedCrop = updatedUserHarvestedCrops.findIndex(
        (item) => item.crop === reward.crop
      );
      if (updatedUserHarvestedCrop !== -1) {
        updatedUserHarvestedCrops[updatedUserHarvestedCrop].quantity +=
          reward.amount;
      } else {
        updatedUserHarvestedCrops.push({
          ...userHarvestedCropSummary,
          quantity: userHarvestedCropSummary.quantity + reward.amount,
        });
      }
    }
    updateUserHarvestedCrops(updatedUserHarvestedCrops);
  };

  const updateUserSpecialCropsFromReward = (
    newGoldCrops: {
      crop: string;
      amount: number;
    }[],
    state: GameState
  ) => {
    const updatedSpecialCrops: Partial<UserItem>[] = [];
    for (const newGoldCrop of newGoldCrops) {
      let specialCrop = state.specialCrops.find(
        (item) => item.item.slug === newGoldCrop.crop
      );
      if (!specialCrop) {
        const cropItem = state.items.find(
          (item) => item.slug === newGoldCrop.crop
        );
        if (cropItem) {
          specialCrop = {
            item: cropItem,
            quantity: 0,
            id: cropItem.id,
            userFid: state.user.fid,
            itemId: cropItem.id,
            createdAt: new Date().toISOString(),
          };
        } else {
          console.error("Special crop item not found", newGoldCrop.crop);
          continue;
        }
      }
      const index = updatedSpecialCrops.findIndex(
        (item) => item.item?.id === specialCrop?.item?.id
      );
      if (index !== -1) {
        updatedSpecialCrops[index].quantity! += newGoldCrop.amount;
      } else {
        updatedSpecialCrops.push({
          item: {
            ...specialCrop.item,
            category: "special-crop",
          },
          quantity: specialCrop?.quantity + newGoldCrop.amount,
          itemId: specialCrop.item.id,
          userFid: state.user.fid,
          createdAt: new Date().toISOString(),
        });
      }
    }
    updateUserItems(updatedSpecialCrops);
  };

  useEffect(() => {
    if (gridBulkResult?.type === ActionType.Harvest) {
      const rewards:
        | {
            crop: string;
            amount: number;
          }[]
        | undefined = gridBulkResult.rewards?.cropsWithRewards;
      if (rewards && state) {
        if (
          gridBulkResult.rewards?.goldCrops &&
          gridBulkResult.rewards?.goldCrops.length > 0
        ) {
          const newGoldCrops = gridBulkResult.rewards.goldCrops
            .filter((goldCrop) => {
              // Check if this crop exists in the specialCrops list
              const cropExists = state.specialCrops.some(
                (specialCrop) => specialCrop.item.slug === goldCrop.crop
              );
              // If it exists, check if quantity is 0 (new)
              // If it doesn't exist at all in specialCrops, it's also new
              return (
                !cropExists ||
                state.specialCrops.some(
                  (specialCrop) =>
                    specialCrop.item.slug === goldCrop.crop &&
                    specialCrop.quantity === 0
                )
              );
            })
            .map((goldCrop) => goldCrop.crop);

          if (newGoldCrops.length > 0) {
            setNewGoldCropsFound([...newGoldCropsFound, ...newGoldCrops]);
          }

          updateUserSpecialCropsFromReward(
            gridBulkResult.rewards.goldCrops,
            state
          );
          setShowHarvestedNewGoldCrops(true);
        }

        if (
          gridBulkResult.rewards?.newBadges &&
          gridBulkResult.rewards.newBadges.length > 0
        ) {
          setShowAchievedNewBadges(true);
        }

        updateUserItemsStateFromReward(rewards, state);
        updateUserHarvestedCropsFromReward(rewards, state);
      }
    }
    setTimeout(() => {
      refetch.claimableQuests();
    }, 6000);
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

  const { mutate: claimRewards } = useClaimReward({
    refetchUserItems: refetch.userItems,
    refetchStreaks: refetch.streaks,
    isActionInProgress,
    setIsActionInProgress,
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
        loading: isLoadingMintCollectible,
        selectedSeed,
        setSelectedSeed,
        selectedPerk,
        setSelectedPerk,
        addGridOperation,
        gridBulkResult,
        buyItem,
        sellItem,
        expandGrid,
        refetchState: refetch.all,
        refetchUser: refetch.user,
        refetchClaimableQuests: refetch.claimableQuests,
        refetchUserItems: refetch.userItems,
        showInventory,
        showMarket,
        showLeaderboard,
        showSettings,
        showSeedsMenu,
        showQuests,
        showTimeline,
        showRequests,
        showStreaks,
        showProfile,
        setShowInventory,
        setShowMarket,
        setShowLeaderboard,
        setShowSettings,
        setShowSeedsMenu,
        setShowQuests,
        setShowTimeline,
        setShowRequests,
        setShowStreaks,
        setShowProfile,
        isActionInProgress,
        setIsActionInProgress,
        activeOverlay,
        setActiveOverlay,
        showLevelUpConfetti,
        setShowLevelUpConfetti,
        floatingNumbers,
        setFloatingNumbers,
        remainingUses,
        setRemainingUses,
        updateGridCells,
        updateUserItems,
        updateUser,
        claimRewards,
        updateUserHarvestedCrops,
        showHarvestedNewGoldCrops,
        setShowHarvestedNewGoldCrops,
        showAchievedNewBadges,
        setShowAchievedNewBadges,
        showMintOGBadge,
        setShowMintOGBadge,
        showMintCollectible,
        setShowMintCollectible,
        newGoldCropsFound,
        setNewGoldCropsFound,
        updateUserWeeklyStats,
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
