import { useUserItems, UserItem } from "./use-user-items";
import { useEffect, useState, useCallback } from "react";
import { useGridCells } from "./use-grid-cells";
import {
  DbCollectible,
  DbGridCell,
  DbItem,
  DbStreak,
  DbUser,
  DbUserHarvestedCrop,
  DbUserHasCollectible,
  DbUserHasQuestWithQuest,
} from "@/supabase/types";
import { useItems } from "./use-items";
import { getCurrentDayStreak, getCurrentLevelAndProgress } from "@/lib/utils";
import { useUserMe } from "./use-user-me";
import { useUserQuests } from "./use-quests";
import { useUpdateUserFrosts, useUserStreaks } from "./use-user-streaks";
import { useUserFrosts } from "./use-user-frosts";
import { useUserHarvestedCrops } from "./use-user-harvested-crops";
import { useWeeklyStats } from "./use-weekly-stats";
import { useUserCollectibles } from "./use-user-collectibles";

export interface RefetchType {
  all: () => Promise<void>;
  userItems: () => Promise<void>;
  items: () => Promise<void>;
  user: () => Promise<void>;
  grid: () => Promise<void>;
  claimableQuests: () => Promise<void>;
  streaks: () => Promise<void>;
  frosts: () => Promise<void>;
}

export interface AllQuests {
  daily: DbUserHasQuestWithQuest[];
  weekly: DbUserHasQuestWithQuest[];
  monthly: DbUserHasQuestWithQuest[];
  farmer: DbUserHasQuestWithQuest[];
}

export interface GameState {
  coins: number;
  level: number;
  experience: number;
  seeds: UserItem[];
  crops: UserItem[];
  grid: DbGridCell[];
  gridSize: {
    width: number;
    height: number;
  };
  perks: UserItem[];
  expansionLevel: number;
  items: DbItem[];
  inventory: UserItem[];
  user: DbUser;
  completedQuests: AllQuests;
  claimableQuests: boolean;
  streakUpdated: boolean;
  streaks: DbStreak[];
  currentStreakDays: number;
  specialItems: UserItem[];
  specialCrops: UserItem[];
  frosts: {
    allFrostsDates: Date[];
    lastStreakDates: Date[];
  };
  claimableStreakReward: boolean;
  harvestedCropsSummary: DbUserHarvestedCrop[];
  weeklyStats: {
    currentScore: number;
    lastScore: number;
    league: number;
  };
  collectibles: (DbUserHasCollectible & { collectible: DbCollectible })[];
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>({
    coins: 0,
    level: 0,
    experience: 0,
    seeds: [],
    crops: [],
    grid: [],
    gridSize: {
      width: 0,
      height: 0,
    },
    perks: [],
    expansionLevel: 0,
    items: [],
    inventory: [],
    user: {} as DbUser,
    completedQuests: {
      daily: [],
      weekly: [],
      monthly: [],
      farmer: [],
    },
    claimableQuests: false,
    streakUpdated: false,
    streaks: [],
    currentStreakDays: 0,
    specialItems: [],
    specialCrops: [],
    frosts: {
      allFrostsDates: [],
      lastStreakDates: [],
    },
    claimableStreakReward: false,
    harvestedCropsSummary: [],
    weeklyStats: {
      currentScore: 0,
      lastScore: 0,
      league: 0,
    },
    collectibles: [],
  });
  const {
    userItems,
    isLoading: userItemsLoading,
    refetch: refetchUserItems,
  } = useUserItems();
  const { user, isLoading: userLoading, refetch: refetchUser } = useUserMe();
  const {
    gridCells,
    isLoading: gridCellsLoading,
    refetch: refetchGrid,
  } = useGridCells();
  const { items, isLoading: itemsLoading, refetch: refetchItems } = useItems();
  const {
    quests: completedQuests,
    isLoading: completedQuestsLoading,
    refetch: refetchClaimableQuests,
  } = useUserQuests(state?.user?.fid, "completed");
  const {
    userStreaks,
    isLoading: streaksLoading,
    refetch: refetchStreaks,
  } = useUserStreaks();
  const {
    userFrosts,
    isLoading: frostsLoading,
    refetch: refetchFrosts,
  } = useUserFrosts();

  const { mutate: updateUserFrosts } = useUpdateUserFrosts({
    refetchStreaks,
    refetchUserItems,
    refetchFrosts,
  });

  const {
    userHarvestedCrops,
    isLoading: isUserHarvestedCropsLoading,
    refetch: refetchUserHarvestedCrops,
  } = useUserHarvestedCrops(state?.user?.fid);

  const {
    userWeeklyStats,
    isLoading: weeklyStatsLoading,
    refetch: refetchWeeklyStats,
  } = useWeeklyStats(state?.user?.fid);

  const {
    userCollectibles,
    isLoading: userCollectiblesLoading,
    refetch: refetchUserCollectibles,
  } = useUserCollectibles(state?.user?.fid);

  const updateUserState = useCallback(() => {
    if (user) {
      const { currentLevel } = getCurrentLevelAndProgress(user.xp);
      setState((prevState) => ({
        ...prevState!,
        coins: user.coins,
        level: currentLevel,
        experience: user.xp,
        expansionLevel: user.expansions - 1,
        user: user,
      }));
    }
  }, [user]);

  const updateUserItemsState = useCallback(() => {
    if (userItems) {
      setState((prevState) => ({
        ...prevState!,
        seeds: userItems.filter((ui) => ui.item.category === "seed"),
        crops: userItems.filter((ui) => ui.item.category === "crop"),
        perks: userItems.filter((item) => item.item.category === "perk"),
        inventory: userItems,
        specialItems: userItems.filter(
          (item) => item.item.category === "special"
        ),
        specialCrops: userItems.filter(
          (item) => item.item.category === "special-crop"
        ),
      }));
    }
  }, [userItems]);

  const updateGridState = useCallback(() => {
    if (gridCells) {
      setState((prevState) => ({
        ...prevState!,
        grid: gridCells,
        gridSize: {
          width: Math.max(...gridCells.map((cell) => cell.x)),
          height: Math.max(...gridCells.map((cell) => cell.y)),
        },
      }));
    }
  }, [gridCells]);

  const updateItemsState = useCallback(() => {
    if (items) {
      setState((prevState) => ({
        ...prevState!,
        items: items.filter((item) => item.category !== "special"),
      }));
    }
  }, [items]);

  const updateClaimableQuestsState = useCallback(() => {
    if (completedQuests) {
      setState((prevState) => ({
        ...prevState!,
        completedQuests: {
          daily: completedQuests.daily,
          weekly: completedQuests.weekly,
          monthly: completedQuests.monthly,
          farmer: completedQuests.farmer,
        },
        claimableQuests:
          (completedQuests.daily?.length ?? 0) > 0 ||
          (completedQuests.weekly?.length ?? 0) > 0 ||
          (completedQuests.monthly?.length ?? 0) > 0 ||
          (completedQuests.farmer?.length ?? 0) > 0,
      }));
    }
  }, [completedQuests]);

  const updateStreaksState = useCallback(() => {
    if (userStreaks) {
      setState((prevState) => ({
        ...prevState!,
        streaks: userStreaks,
      }));
    }
  }, [userStreaks]);

  const updateUserFrostsState = useCallback(() => {
    if (userFrosts) {
      setState((prevState) => ({
        ...prevState!,
        frosts: userFrosts,
      }));
    }
  }, [userFrosts]);

  const updateUserHarvestedCropsState = useCallback(() => {
    if (userHarvestedCrops) {
      setState((prevState) => ({
        ...prevState!,
        harvestedCropsSummary: userHarvestedCrops,
      }));
    }
  }, [userHarvestedCrops]);

  const updateUserWeeklyStatsState = useCallback(() => {
    if (userWeeklyStats) {
      setState((prevState) => ({
        ...prevState!,
        weeklyStats: {
          currentScore: userWeeklyStats.currentScore,
          lastScore: userWeeklyStats.lastScore,
          league: userWeeklyStats.league,
        },
      }));
    }
  }, [userWeeklyStats]);

  const updateUserCollectiblesState = useCallback(() => {
    if (userCollectibles) {
      setState((prevState) => ({
        ...prevState!,
        collectibles: userCollectibles,
      }));
    }
  }, [userCollectibles]);

  useEffect(() => {
    updateUserState();
  }, [user, updateUserState]);

  useEffect(() => {
    updateUserItemsState();
  }, [userItems, updateUserItemsState]);

  useEffect(() => {
    const userFrosts = userItems?.find((item) => item.item.slug === "frost");
    if (
      userStreaks?.length === 0 &&
      (!userFrosts || userFrosts.quantity === 0)
    ) {
      updateUserFrosts({});
    }
  }, [userItems, userStreaks, updateUserFrosts]);

  useEffect(() => {
    updateGridState();
  }, [gridCells, updateGridState]);

  useEffect(() => {
    updateItemsState();
  }, [items, updateItemsState]);

  useEffect(() => {
    updateClaimableQuestsState();
  }, [completedQuests, updateClaimableQuestsState]);

  useEffect(() => {
    updateStreaksState();
    const latestStreak = userStreaks?.[0];
    if (latestStreak) {
      const lastActionAt = new Date(latestStreak.lastActionAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      if (lastActionAt >= today) {
        setState((prevState) => ({
          ...prevState!,
          streakUpdated: true,
        }));
      } else if (lastActionAt < yesterday) {
        updateUserFrosts({});
      }
    }
  }, [userStreaks, updateStreaksState]);

  useEffect(() => {
    if (userStreaks && userStreaks[0]) {
      const currentDayStreak = getCurrentDayStreak(
        userStreaks[0],
        state.frosts.lastStreakDates
      );
      const lastClaimed = userStreaks[0].lastClaimed;
      if (currentDayStreak > lastClaimed) {
        setState((prevState) => ({
          ...prevState!,
          currentStreakDays: currentDayStreak,
          claimableStreakReward: true,
        }));
      } else {
        setState((prevState) => ({
          ...prevState!,
          currentStreakDays: currentDayStreak,
          claimableStreakReward: false,
        }));
      }
    }
  }, [userStreaks, state.frosts.lastStreakDates]);

  useEffect(() => {
    updateUserFrostsState();
  }, [userFrosts, updateUserFrostsState]);

  useEffect(() => {
    if (state.user?.fid) {
      updateUserHarvestedCropsState();
      updateUserWeeklyStatsState();
      updateUserCollectiblesState();
    }
  }, [
    userHarvestedCrops,
    updateUserHarvestedCropsState,
    state.user?.fid,
    updateUserWeeklyStatsState,
    updateUserCollectiblesState,
  ]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchUserItems(),
      refetchUser(),
      refetchGrid(),
      refetchItems(),
      refetchClaimableQuests(),
      refetchStreaks(),
      refetchUserHarvestedCrops(),
      refetchWeeklyStats(),
      refetchUserCollectibles(),
    ]);
  }, [
    refetchUserItems,
    refetchUser,
    refetchGrid,
    refetchItems,
    refetchClaimableQuests,
    refetchStreaks,
    refetchUserHarvestedCrops,
    refetchWeeklyStats,
    refetchUserCollectibles,
  ]);

  // Add new method to update grid cells directly
  const updateGridCells = useCallback((updatedCells: Partial<DbGridCell>[]) => {
    setState((prevState) => {
      if (!prevState) return prevState;

      const newGrid = [...prevState.grid];

      updatedCells.forEach((updatedCell) => {
        const index = newGrid.findIndex(
          (cell) => cell.x === updatedCell.x && cell.y === updatedCell.y
        );
        if (index !== -1) {
          newGrid[index] = { ...newGrid[index], ...updatedCell };
        }
      });

      return {
        ...prevState,
        grid: newGrid,
      };
    });
  }, []);

  // Add new method to update user items directly
  const updateUserItems = useCallback((updatedItems: Partial<UserItem>[]) => {
    setState((prevState) => {
      if (!prevState) return prevState;

      const newSeeds = [...prevState.seeds];
      const newPerks = [...prevState.perks];
      const newCrops = [...prevState.crops];
      const newSpecialItems = [...prevState.specialItems];
      const newSpecialCrops = [...prevState.specialCrops];

      updatedItems.forEach((updatedItem) => {
        if (updatedItem.item && updatedItem.item.category === "seed") {
          const index = newSeeds.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newSeeds[index] = { ...newSeeds[index], ...updatedItem };
          }
        } else if (updatedItem.item && updatedItem.item.category === "perk") {
          const index = newPerks.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newPerks[index] = { ...newPerks[index], ...updatedItem };
          }
        } else if (updatedItem.item && updatedItem.item.category === "crop") {
          const index = newCrops.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newCrops[index] = { ...newCrops[index], ...updatedItem };
          } else {
            newCrops.push(updatedItem as UserItem);
          }
        } else if (
          updatedItem.item &&
          updatedItem.item.category === "special-crop"
        ) {
          const index = newSpecialCrops.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newSpecialCrops[index] = {
              ...newSpecialCrops[index],
              ...updatedItem,
            };
          } else {
            newSpecialCrops.push(updatedItem as UserItem);
          }
        } else if (
          updatedItem.item &&
          updatedItem.item.category === "special"
        ) {
          const index = newSpecialItems.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newSpecialItems[index] = {
              ...newSpecialItems[index],
              ...updatedItem,
            };
          } else {
            newSpecialItems.push(updatedItem as UserItem);
          }
        }
      });

      return {
        ...prevState,
        seeds: newSeeds,
        perks: newPerks,
        crops: newCrops,
        specialItems: newSpecialItems,
        specialCrops: newSpecialCrops,
      };
    });
  }, []);

  const updateUserHarvestedCrops = useCallback(
    (updatedUserHarvestedCrops: DbUserHarvestedCrop[]) => {
      setState((prevState) => {
        if (!prevState) return prevState;

        const newHarvestedCrops = [...prevState.harvestedCropsSummary];

        updatedUserHarvestedCrops.forEach((updatedHarvestedCrop) => {
          const index = newHarvestedCrops.findIndex(
            (harvestedCrop) => harvestedCrop.crop === updatedHarvestedCrop.crop
          );
          if (index !== -1) {
            newHarvestedCrops[index] = updatedHarvestedCrop;
          } else {
            newHarvestedCrops.push(updatedHarvestedCrop);
          }
        });

        return {
          ...prevState,
          harvestedCropsSummary: newHarvestedCrops,
        };
      });
    },
    []
  );

  const updateUserWeeklyStats = useCallback(
    (weeklyStats: {
      currentScore: number;
      lastScore?: number;
      league?: number;
    }) => {
      setState((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          weeklyStats: {
            currentScore: weeklyStats.currentScore,
            lastScore: weeklyStats.lastScore ?? prevState.weeklyStats.lastScore,
            league: weeklyStats.league ?? prevState.weeklyStats.league,
          },
        };
      });
    },
    []
  );

  const updateUser = useCallback(
    (newParams: {
      xp?: number;
      level?: number;
      coins?: number;
      streaks?: DbStreak[];
      streakUpdated?: boolean;
      mintedOG?: boolean;
    }) => {
      setState((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          experience: newParams.xp ?? prevState.experience,
          level: newParams.level ?? prevState.level,
          user: {
            ...prevState.user,
            xp: newParams.xp ?? prevState.experience,
            mintedOG: newParams.mintedOG ?? prevState.user.mintedOG,
          },
          coins: newParams.coins ?? prevState.coins,
        };
      });
    },
    []
  );

  return {
    state,
    loading:
      userItemsLoading ||
      itemsLoading ||
      userLoading ||
      gridCellsLoading ||
      completedQuestsLoading ||
      streaksLoading ||
      frostsLoading ||
      isUserHarvestedCropsLoading ||
      weeklyStatsLoading ||
      userCollectiblesLoading,
    refetch: {
      all: refetchAll,
      userItems: async () => {
        await refetchUserItems();
      },
      items: async () => {
        await refetchItems();
      },
      user: async () => {
        await refetchUser();
      },
      grid: async () => {
        await refetchGrid();
      },
      claimableQuests: async () => {
        await refetchClaimableQuests();
      },
      collectibles: async () => {
        await refetchUserCollectibles();
      },
      streaks: async () => {
        await refetchStreaks();
      },
      frosts: async () => {
        await refetchFrosts();
      },
    } as RefetchType,
    updateGridCells,
    updateUserItems,
    updateUser,
    updateUserHarvestedCrops,
    updateUserWeeklyStats,
  };
};
