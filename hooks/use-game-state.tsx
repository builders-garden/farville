import { useUserItems, UserItem } from "./use-user-items";
import { useMemo, useEffect, useState, useCallback, useRef } from "react";
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
  clan: () => Promise<void>;
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
}

export const useGameState = (mode: Mode) => {
  // Data hooks
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
  } = useUserQuests(user?.fid, "completed", mode);
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
  } = useUserHarvestedCrops(user?.fid);
  const {
    userWeeklyStats,
    isLoading: weeklyStatsLoading,
    refetch: refetchWeeklyStats,
  } = useWeeklyStats(mode, user?.fid);
  const {
    data: communityDonations,
    isLoading: isLoadingCommunityDonations,
    refetch: refetchCommunityDonations,
  } = useCommunityDonation(mode);
  const {
    userCollectibles,
    isLoading: userCollectiblesLoading,
    refetch: refetchUserCollectibles,
  } = useUserCollectibles(user?.fid);
  const {
    userModes,
    isLoading: isLoadingUserModes,
    refetch: refetchUserModes,
  } = useUserModes(user?.fid);
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
  const { userGlobalStats } = useUserGlobalStats(user?.fid);

  // Derived state
  const seeds = useMemo(
    () => userItems?.filter((ui) => ui.item.category === "seed") ?? [],
    [userItems]
  );
  const crops = useMemo(
    () => userItems?.filter((ui) => ui.item.category === "crop") ?? [],
    [userItems]
  );
  const perks = useMemo(
    () => userItems?.filter((ui) => ui.item.category === "perk") ?? [],
    [userItems]
  );
  const specialItems = useMemo(
    () => userItems?.filter((ui) => ui.item.category === "special") ?? [],
    [userItems]
  );
  const specialCrops = useMemo(
    () => userItems?.filter((ui) => ui.item.category === "special-crop") ?? [],
    [userItems]
  );
  const inventory = useMemo(() => userItems ?? [], [userItems]);
  const grid = useMemo(() => gridCells ?? [], [gridCells]);
  const gridSize = useMemo(() => {
    if (!gridCells || gridCells.length === 0) return { width: 0, height: 0 };
    return {
      width: Math.max(...gridCells.map((cell) => cell.x)),
      height: Math.max(...gridCells.map((cell) => cell.y)),
    };
  }, [gridCells]);
  const expansionLevel = useMemo(
    () => (user ? user.expansions - 1 : 0),
    [user]
  );
  const level = useMemo(
    () => (user ? getCurrentLevelAndProgress(user.xp).currentLevel : 0),
    [user]
  );
  const experience = useMemo(() => user?.xp ?? 0, [user]);
  const coins = useMemo(() => user?.coins ?? 0, [user]);
  const completedQuestsState = useMemo(
    () => completedQuests ?? { daily: [], weekly: [] },
    [completedQuests]
  );
  const claimableQuests = useMemo(
    () =>
      (completedQuests?.daily?.length ?? 0) > 0 ||
      (completedQuests?.weekly?.length ?? 0) > 0,
    [completedQuests]
  );
  const streaks = useMemo(() => userStreaks ?? [], [userStreaks]);
  const frosts = useMemo(
    () => userFrosts ?? { allFrostsDates: [], lastStreakDates: [] },
    [userFrosts]
  );
  const harvestedCropsSummary = useMemo(
    () => userHarvestedCrops ?? [],
    [userHarvestedCrops]
  );
  const weeklyStats = useMemo(
    () => userWeeklyStats ?? { currentScore: 0, lastScore: 0, league: 0 },
    [userWeeklyStats]
  );
  const collectibles = useMemo(
    () => userCollectibles ?? [],
    [userCollectibles]
  );
  const showGridCellsTutorial = useMemo(() => {
    if (!userGlobalStats || !user) return false;
    let totalXP = 0;
    Object.keys(userGlobalStats).forEach((key) => {
      const userStat = userGlobalStats[key as Mode];
      if (userStat) totalXP += userStat.xp;
    });
    return totalXP === 0;
  }, [userGlobalStats, user]);
  const showMarketplaceTutorial = useMemo(() => {
    if (!userGlobalStats || !user) return false;
    let totalXP = 0;
    let totalCoins = 0;
    Object.keys(userGlobalStats).forEach((key) => {
      const userStat = userGlobalStats[key as Mode];
      if (userStat) {
        totalXP += userStat.xp;
        totalCoins += userStat.coins;
      }
    });
    const carrotsXp = CROP_DATA["carrot"].rewardXP;
    return totalXP < carrotsXp * 4 && totalCoins === 0 && user.coins === 0;
  }, [userGlobalStats, user]);
  const [isFarmersPowerOn, setIsFarmersPowerOn] = useState(
    isFarmersPowerActive()
  );
  // Booster status and manual update tracking
  const [communityBoosterStatus, setCommunityBoosterStatus] = useState<{
    stage: number;
    points: number;
    combo: number;
    mode: Mode;
    lastDonation: Date;
  } | null>(null);
  const lastManualUpdateRef = useRef<number>(0);
  // Clan
  const [clan, setClan] = useState<UserClan | undefined>(undefined);
  useEffect(() => {
    setClan(userClan);
  }, [userClan]);
  // Farmers Power timer effect
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
      const nextState = isFarmersPowerActive();
      setIsFarmersPowerOn((prev) => {
        if (prev !== nextState) {
          // Reset booster status if turning off
          if (!nextState) {
            setCommunityBoosterStatus((prevStatus) =>
              prevStatus
                ? { ...prevStatus, points: 0, stage: 1, combo: 1 }
                : null
            );
          }
        }
        return nextState;
      });
      return recheckEveryTenSeconds;
    };
    const shouldRecheck = checkFarmersPower();
    if (shouldRecheck) {
      const interval = setInterval(checkFarmersPower, 10000);
      return () => clearInterval(interval);
    }
  }, []);
  // Community Booster Status effect
  useEffect(() => {
    if (!userCommunityBoosterStatus) return;
    if (Date.now() - lastManualUpdateRef.current < 2000) return;
    const lastDonationDate =
      communityDonations && communityDonations.length > 0
        ? new Date(communityDonations[0].createdAt)
        : new Date(userCommunityBoosterStatus.donation.createdAt);
    if (!isFarmersPowerOn) {
      setCommunityBoosterStatus({
        stage: 1,
        points: 0,
        combo: 1,
        mode: userCommunityBoosterStatus.mode as Mode,
        lastDonation: lastDonationDate,
      });
    } else {
      setCommunityBoosterStatus({
        stage: userCommunityBoosterStatus.stage,
        points: userCommunityBoosterStatus.points,
        combo: userCommunityBoosterStatus.combo,
        mode: userCommunityBoosterStatus.mode as Mode,
        lastDonation: lastDonationDate,
      });
    }
  }, [userCommunityBoosterStatus, communityDonations, isFarmersPowerOn]);
  // Streak reward logic
  const [currentStreakDays, setCurrentStreakDays] = useState(0);
  const [claimableStreakReward, setClaimableStreakReward] = useState(false);
  useEffect(() => {
    if (userStreaks && userStreaks[0]) {
      const currentDayStreak = getCurrentDayStreak(
        userStreaks[0],
        frosts.lastStreakDates
      );
      const lastClaimed = userStreaks[0].lastClaimed;
      setCurrentStreakDays(currentDayStreak);
      setClaimableStreakReward(currentDayStreak > lastClaimed);
    }
  }, [userStreaks, frosts.lastStreakDates]);
  // StreakUpdated logic
  const [streakUpdated, setStreakUpdated] = useState(false);
  useEffect(() => {
    const latestStreak = userStreaks?.[0];
    if (latestStreak) {
      const lastActionAt = new Date(latestStreak.lastActionAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      if (lastActionAt >= today) {
        setStreakUpdated(true);
      } else if (lastActionAt < yesterday) {
        updateUserFrosts({});
      }
    }
  }, [userStreaks, updateUserFrosts]);
  // Community booster imperative update
  const updateUserCommunityBoosterStatus = useCallback(
    (statusParams: {
      pointsToAdd: number;
      stage: number;
      combo: number;
      lastDonation?: Date;
    }) => {
      lastManualUpdateRef.current = Date.now();
      setCommunityBoosterStatus((prevStatus) => {
        if (!prevStatus) return prevStatus;
        return {
          ...prevStatus,
          stage: statusParams.stage,
          points: prevStatus.points + statusParams.pointsToAdd,
          combo: statusParams.combo,
          lastDonation: statusParams.lastDonation ?? prevStatus.lastDonation,
        };
      });
    },
    []
  );
  // User items imperative update
  const updateUserItems = useCallback(() => {
    // No-op
  }, []);
  // Grid cells imperative update
  const updateGridCells = useCallback(() => {
    // No-op
  }, []);
  // User imperative update
  const updateUser = useCallback(() => {
    // No-op
  }, []);
  // Harvested crops imperative update
  const updateUserHarvestedCrops = useCallback(() => {
    // No-op
  }, []);
  // Weekly stats imperative update
  const updateUserWeeklyStats = useCallback(() => {
    // No-op
  }, []);
  // Collectibles imperative update
  const updateUserCollectibles = useCallback(() => {
    // No-op
  }, []);
  // Make all grid cells harvestable
  const makeAllGridCellsHarvestable = useCallback(() => {
    // No-op
  }, []);
  // Refetch all
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
  // Compose state
  const state: GameState = {
    coins,
    level,
    experience,
    seeds,
    crops,
    grid,
    gridSize,
    perks,
    expansionLevel,
    items: items?.filter((item) => item.category !== "special") ?? [],
    inventory,
    user: user ?? ({} as UserWithStatistic),
    completedQuests: completedQuestsState,
    claimableQuests,
    streakUpdated,
    streaks,
    currentStreakDays,
    specialItems,
    specialCrops,
    frosts,
    claimableStreakReward,
    harvestedCropsSummary,
    weeklyStats,
    collectibles,
    showGridCellsTutorial,
    showMarketplaceTutorial,
    userModes: userModes ?? [],
    communityBoosterStatus,
    communityDonations: communityDonations ?? [],
    isFarcasterManiaOn: false, // Not enough info to derive
    isFarmersPowerOn,
    clan,
  };
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
      isLoadingUserClan,
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
      clan: async () => {
        await refetchUserClan();
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
  };
};
