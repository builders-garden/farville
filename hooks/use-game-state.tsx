import { useUserItems, UserItem } from "./use-user-items";
import { useEffect, useState, useCallback, useRef } from "react";
import { useGridCells } from "./use-grid-cells";
import { useItems } from "./use-items";
import {
  getCurrentDayStreak,
  getCurrentLevelAndProgress,
  isFarmersPowerActive,
} from "@/lib/utils";
import { useUserMe } from "./use-user-me";
import { useUserQuests } from "./use-quests";
import { useUpdateUserFrosts, useUserStreaks } from "./use-user-streaks";
import { useUserFrosts } from "./use-user-frosts";
import { useUserHarvestedCrops } from "./use-user-harvested-crops";
import { useWeeklyStats } from "./use-weekly-stats";
import { useUserCollectibles } from "./use-user-collectibles";
import { CROP_DATA, FP_TIME } from "../lib/game-constants";
import {
  UserHasQuestWithQuest,
  UserWithStatistic,
  UserCommunityDonationEnhanced,
  UserClan,
} from "@/lib/prisma/types";
import {
  Collectible,
  UserGridCell,
  Streak,
  UserHarvestedCrop,
  UserHasCollectible,
  Item,
} from "@prisma/client";
import { Mode } from "@/lib/types/game";
import { useUserModes } from "./use-user-modes";
import { useUserGlobalStats } from "./use-user-global-stats";
import { useCommunityBoosterStatus } from "./use-community-booster";
import { useCommunityDonation } from "./use-community-donation";
import { useUserClan } from "./use-user-clan";
import { useUserClanRequests } from "./use-user-clan-requests";

export interface RefetchType {
  all: () => Promise<void>;
  userItems: () => Promise<void>;
  items: () => Promise<void>;
  user: () => Promise<void>;
  grid: () => Promise<void>;
  claimableQuests: () => Promise<void>;
  streaks: () => Promise<void>;
  frosts: () => Promise<void>;
  userModes: () => Promise<void>;
  communityDonations: () => Promise<void>;
  userClan: () => Promise<void>;
}

export interface AllQuests {
  daily: UserHasQuestWithQuest[];
  weekly: UserHasQuestWithQuest[];
}

export interface GameState {
  coins: number;
  level: number;
  experience: number;
  seeds: UserItem[];
  crops: UserItem[];
  grid: UserGridCell[];
  gridSize: {
    width: number;
    height: number;
  };
  perks: UserItem[];
  expansionLevel: number;
  items: Item[];
  inventory: UserItem[];
  user: UserWithStatistic;
  completedQuests: AllQuests;
  claimableQuests: boolean;
  streakUpdated: boolean;
  streaks: Streak[];
  currentStreakDays: number;
  specialItems: UserItem[];
  specialCrops: UserItem[];
  frosts: {
    allFrostsDates: Date[];
    lastStreakDates: Date[];
  };
  claimableStreakReward: boolean;
  harvestedCropsSummary: UserHarvestedCrop[];
  weeklyStats: {
    currentScore: number;
    lastScore: number;
    league: number;
  };
  collectibles: (Collectible & {
    userHasCollectible: UserHasCollectible | null;
  })[];
  showGridCellsTutorial: boolean;
  showMarketplaceTutorial: boolean;
  userModes: Mode[];
  communityBoosterStatus: {
    stage: number;
    points: number;
    combo: number;
    mode: Mode;
    lastDonation: Date;
  } | null;
  communityDonations: UserCommunityDonationEnhanced[];
  isFarcasterManiaOn: boolean;
  isFarmersPowerOn: boolean;
  clan?: UserClan;
  hasUnfulfilledClanRequests: boolean;
}

export const useGameState = (mode: Mode) => {
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
    user: {} as UserWithStatistic,
    completedQuests: {
      daily: [],
      weekly: [],
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
    showGridCellsTutorial: false,
    showMarketplaceTutorial: false,
    userModes: [],
    communityBoosterStatus: null,
    communityDonations: [],
    isFarcasterManiaOn: false,
    isFarmersPowerOn: false,
    hasUnfulfilledClanRequests: false,
  });

  const {
    userItems,
    isLoading: userItemsLoading,
    refetch: refetchUserItems,
  } = useUserItems(mode);
  const {
    user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useUserMe(mode);
  const {
    gridCells,
    isLoading: gridCellsLoading,
    refetch: refetchGrid,
  } = useGridCells(mode);
  const { items, isLoading: itemsLoading, refetch: refetchItems } = useItems();
  const {
    quests: completedQuests,
    isLoading: completedQuestsLoading,
    refetch: refetchClaimableQuests,
  } = useUserQuests(state?.user?.fid, "completed", mode);
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
  } = useWeeklyStats(mode, state?.user?.fid);

  const {
    data: communityDonations,
    isLoading: isLoadingCommunityDonations,
    refetch: refetchCommunityDonations,
  } = useCommunityDonation(mode);

  const {
    userCollectibles,
    isLoading: userCollectiblesLoading,
    refetch: refetchUserCollectibles,
  } = useUserCollectibles(state?.user?.fid);

  const {
    userModes,
    isLoading: isLoadingUserModes,
    refetch: refetchUserModes,
  } = useUserModes(state?.user?.fid);

  const {
    userCommunityBoosterStatus,
    isLoading: isLoadingUserCommunityBoosterStatus,
    refetch: refetchUserCommunityBoosterStatus,
  } = useCommunityBoosterStatus(mode);

  const {
    userClan,
    isLoading: isLoadingUserClan,
    refetch: refetchUserClan,
  } = useUserClan(user?.fid);

  const {
    hasUnfulfilledRequests,
    isLoading: isLoadingClanRequests,
    refetch: refetchClanRequests,
  } = useUserClanRequests(userClan?.clan?.id, user?.fid);

  const updateUserClanState = useCallback(() => {
    if (userClan) {
      setState((prevState) => ({
        ...prevState!,
        clan: userClan,
        hasUnfulfilledClanRequests: hasUnfulfilledRequests,
      }));
    }
  }, [userClan, hasUnfulfilledRequests]);

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

  const updateCommunityDonationsState = useCallback(() => {
    if (communityDonations) {
      setState((prevState) => ({
        ...prevState!,
        communityDonations: communityDonations,
      }));
    }
  }, [communityDonations]);

  // Track manual updates to prevent automatic overwriting
  const lastManualUpdateRef = useRef<number>(0);

  const updateUserCommunityBoosterStatusState = useCallback(() => {
    if (userCommunityBoosterStatus) {
      // If we've had a manual update recently (within 2 seconds), don't overwrite it
      if (Date.now() - lastManualUpdateRef.current < 2000) {
        console.log("Skipping automatic update due to recent manual update");
        return;
      }

      // Get the last donation date either from communityDonations or from the booster status
      const lastDonationDate =
        communityDonations && communityDonations.length > 0
          ? new Date(communityDonations[0].createdAt)
          : new Date(userCommunityBoosterStatus.donation.createdAt);

      setState((prevState) => {
        // If Farmers Power is not active, reset the values
        if (!prevState?.isFarmersPowerOn) {
          return {
            ...prevState!,
            communityBoosterStatus: {
              stage: 1,
              points: 0,
              combo: 1,
              mode: userCommunityBoosterStatus.mode as Mode,
              lastDonation: lastDonationDate,
            },
          };
        }

        // Otherwise use the values from API
        return {
          ...prevState!,
          communityBoosterStatus: {
            stage: userCommunityBoosterStatus.stage,
            points: userCommunityBoosterStatus.points,
            combo: userCommunityBoosterStatus.combo,
            mode: userCommunityBoosterStatus.mode as Mode,
            lastDonation: lastDonationDate,
          },
        };
      });
    }
  }, [userCommunityBoosterStatus, communityDonations]);

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

  useEffect(() => {
    if (userModes) {
      setState((prevState) => ({
        ...prevState!,
        userModes: userModes,
      }));
    }
  }, [userModes]);

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
        },
        claimableQuests:
          (completedQuests.daily?.length ?? 0) > 0 ||
          (completedQuests.weekly?.length ?? 0) > 0,
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

  // Effect to determine if Farmers Power is active
  useEffect(() => {
    const checkFarmersPower = () => {
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const hourOfDay = now.getUTCHours();

      const isStartDay = dayOfWeek === FP_TIME.START_DAY;
      const isEndDay = dayOfWeek === FP_TIME.END_DAY;

      const isTransitionHour =
        (isStartDay && hourOfDay === FP_TIME.START_HOUR) ||
        (isEndDay && hourOfDay === FP_TIME.END_HOUR);

      const recheckEveryTenSeconds = isTransitionHour;

      const isFarmersPowerOn = isFarmersPowerActive();

      // Check if Farmers Power state has changed
      const wasFarmersPowerOn = state?.isFarmersPowerOn;

      setState((prevState) => {
        // If Farmers Power just turned off, reset community booster status
        if (wasFarmersPowerOn && !isFarmersPowerOn && prevState) {
          return {
            ...prevState,
            isFarmersPowerOn,
            // Reset community booster values if FP is inactive
            communityBoosterStatus: prevState.communityBoosterStatus
              ? {
                  ...prevState.communityBoosterStatus,
                  points: 0,
                  stage: 1,
                  combo: 1,
                }
              : null,
          };
        }

        // If Farmers Power just turned on, update the lastDonation to now
        // This ensures timer starts with full duration when FP is activated
        if (!wasFarmersPowerOn && isFarmersPowerOn && prevState) {
          const now = new Date();
          return {
            ...prevState,
            isFarmersPowerOn,
            // Set lastDonation to now if communityBoosterStatus exists
            communityBoosterStatus: prevState.communityBoosterStatus
              ? {
                  ...prevState.communityBoosterStatus,
                  points: 0,
                  stage: 1,
                  combo: 1,
                  lastDonation: now,
                }
              : null,
          };
        }

        return {
          ...prevState!,
          isFarmersPowerOn,
        };
      });

      return recheckEveryTenSeconds;
    };

    // Initial check and get initial recheck status
    const shouldRecheck = checkFarmersPower();

    // Set up interval if needed
    if (shouldRecheck) {
      const interval = setInterval(checkFarmersPower, 10000);
      return () => clearInterval(interval);
    }
  }, [state?.isFarmersPowerOn]); // Include dependencies

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
    updateCommunityDonationsState();
  }, [communityDonations, updateCommunityDonationsState]);

  useEffect(() => {
    // Don't run this effect if we've had a manual update recently
    if (Date.now() - lastManualUpdateRef.current < 2000) {
      return;
    }
    updateUserCommunityBoosterStatusState();
  }, [userCommunityBoosterStatus, updateUserCommunityBoosterStatusState]);

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
  }, [userStreaks, updateStreaksState, updateUserFrosts]);

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
  }, [userStreaks, state.frosts.lastStreakDates, updateUserFrosts]);

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

  useEffect(() => {
    updateUserClanState();
  }, [userClan, updateUserClanState]);

  useEffect(() => {
    if (userClan) {
      setState((prevState) => ({
        ...prevState!,
        hasUnfulfilledClanRequests: hasUnfulfilledRequests,
      }));
    }
  }, [hasUnfulfilledRequests, userClan]);

  const { userGlobalStats } = useUserGlobalStats(state.user?.fid);

  useEffect(() => {
    if (
      state.user &&
      state.user.expansions &&
      userGlobalStats &&
      userGlobalStats?.classic.expansions
    ) {
      // for each mode inside userGlobalStats calculate the global xps
      let totalXP = 0;
      let totalCoins = 0;
      Object.keys(userGlobalStats).forEach((key) => {
        const userStat = userGlobalStats[key as Mode];
        if (userStat) {
          totalXP += userStat.xp;
          totalCoins += userStat.coins;
        }
      });

      // check if the user should see the grid cells tutorial
      if (totalXP === 0) {
        setState((prevState) => ({
          ...prevState!,
          showGridCellsTutorial: true,
        }));
      } else {
        setState((prevState) => ({
          ...prevState!,
          showGridCellsTutorial: false,
        }));
      }
      const carrotsXp = CROP_DATA["carrot"].rewardXP;

      // check if the user should see the marketplace tutorial
      if (
        totalXP < carrotsXp * 4 &&
        totalCoins === 0 &&
        state.user.coins === 0
      ) {
        setState((prevState) => ({
          ...prevState!,
          showMarketplaceTutorial: true,
        }));
      } else {
        setState((prevState) => ({
          ...prevState!,
          showMarketplaceTutorial: false,
        }));
      }
    }
  }, [state.user, userGlobalStats]);

  // Removed duplicate effect for userCommunityBoosterStatus - using only updateUserCommunityBoosterStatusState

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
      refetchUserModes(),
      refetchUserCommunityBoosterStatus(),
      refetchCommunityDonations(),
      refetchUserClan(),
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
    refetchUserModes,
    refetchUserCommunityBoosterStatus,
    refetchCommunityDonations,
    refetchUserClan,
  ]);

  useEffect(() => {
    refetchAll();
  }, [mode, refetchAll]);

  // Add new method to update grid cells directly
  const updateGridCells = useCallback(
    (updatedCells: Partial<UserGridCell>[]) => {
      setState((prevState) => {
        if (!prevState) return prevState;

        const newGrid = [...prevState.grid];

        updatedCells.forEach((updatedCell) => {
          const index = newGrid.findIndex(
            (cell) =>
              cell.x === updatedCell.x &&
              cell.y === updatedCell.y &&
              cell.mode === updatedCell.mode
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
    },
    []
  );

  const makeAllGridCellsHarvestable = useCallback(() => {
    setState((prevState) => {
      if (!prevState) return prevState;
      const newGrid = prevState.grid.map((cell) => ({
        ...cell,
        isReadyToHarvest: true,
      }));
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
    (updatedUserHarvestedCrops: UserHarvestedCrop[]) => {
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

  const updateUserCollectibles = useCallback(
    (
      updatedCollectibles: (Collectible & {
        userHasCollectible: UserHasCollectible | null;
      })[]
    ) => {
      setState((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          collectibles: updatedCollectibles,
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
      streaks?: Streak[];
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

  const updateUserCommunityBoosterStatus = useCallback(
    (statusParams: {
      pointsToAdd: number;
      stage: number;
      combo: number;
      lastDonation?: Date;
    }) => {
      // Mark this as a manual update
      lastManualUpdateRef.current = Date.now();

      setState((prevState) => {
        if (!prevState) return prevState;

        const currentStatus = prevState.communityBoosterStatus;
        if (!currentStatus) return prevState;

        console.log("new status:", {
          mode: currentStatus.mode,
          stage: statusParams.stage,
          lastDonation: statusParams.lastDonation ?? currentStatus.lastDonation,
          points: currentStatus.points + statusParams.pointsToAdd,
          combo: statusParams.combo,
        });

        return {
          ...prevState,
          communityBoosterStatus: {
            mode: currentStatus.mode,
            stage: statusParams.stage,
            lastDonation:
              statusParams.lastDonation ?? currentStatus.lastDonation,
            points: currentStatus.points + statusParams.pointsToAdd,
            combo: statusParams.combo,
          },
        };
      });

      // Log that we've completed the manual update
      console.log("Manual update of community booster status complete");
    },
    []
  );

  const updateUserClan = useCallback((clan: UserClan | undefined) => {
    setState((prevState) => ({
      ...prevState,
      clan,
    }));
  }, []);

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
      userCollectiblesLoading ||
      isLoadingUserModes ||
      isLoadingUserCommunityBoosterStatus ||
      isLoadingCommunityDonations ||
      isLoadingUserClan ||
      isLoadingClanRequests,
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
      userModes: async () => {
        await refetchUserModes();
      },
      communityDonations: async () => {
        await refetchCommunityDonations();
      },
      userClan: async () => {
        await refetchUserClan();
        await refetchClanRequests();
      },
    } as RefetchType,
    updateGridCells,
    updateUserItems,
    updateUser,
    updateUserHarvestedCrops,
    updateUserWeeklyStats,
    updateUserCollectibles,
    updateUserCommunityBoosterStatus,
    makeAllGridCellsHarvestable,
    updateUserClan, // <-- add this
  };
};
