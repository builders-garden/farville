import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ACHIEVEMENTS_GOLD_MULTIPLIER,
  ACHIEVEMENTS_THRESHOLDS,
  BASE_GOLD_CROP_PERCENTAGE,
  CROP_DATA,
  LEVEL_XP_THRESHOLDS,
  MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS,
  MAX_DAILY_ALLOWED_DONATION_TO_USERS,
  SPEED_BOOST,
} from "./game-constants";
import { CropType, Mode, PerkType, QuestType } from "@/lib/types/game";
import { fetchUsersFollowedBy } from "./neynar";
import {
  getModePartialLeaderboardFromFids,
  getModePartialLeaderboardFromUserPosition,
  getQuestLeaderboard,
  getQuestPartialLeaderboard,
  getQuestPartialLeaderboardFromFids,
  getUserByMode,
  getLeaderboardUserPositionByMode,
  getUsersByXp,
  getUserLeaderboardEntry,
  createUserLeaderboardEntry,
  getUserHasQuests,
  initDailyUserQuests,
  initWeeklyUserQuests,
} from "./prisma/queries";
import { encodeFunctionData, Address, Hex } from "viem";
import { PFP_NFT_ABI } from "./contracts/pfp-nft/abi";
import { env } from "@/lib/env";
import { DbUserDonation } from "@/lib/prisma/types";
import { Item, Streak, UserHarvestedCrop } from "@prisma/client";
import { MODE_DEFINITIONS, ModeFeature } from "./modes/constants";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumberWithSuffix = (value: number, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  // For values less than 1000, just return the number with fixed decimals
  if (Math.abs(value) < 1000) {
    return value.toFixed(decimals);
  }

  // For thousands (k)
  if (Math.abs(value) < 1000000) {
    return (value / 1000).toFixed(decimals) + "k";
  }

  // For millions (M)
  return (value / 1000000).toFixed(decimals) + "M";
};

export const warpcastComposeCastUrl = () => {
  const frameUrl = env.NEXT_PUBLIC_URL;
  const text = `I'm tired of touching grass IRL, and I can't wait to touch PIXEL grass in /farville...\n\nBuild my dream farm and grow quirky crops. It's honest work, but way more fun than real farming!🧑‍🌾`;
  const urlFriendlyText = encodeURIComponent(text);
  return `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
    frameUrl
  )}&channelKey=farville`;
};

export const requestItemComposeCastUrl = (
  requestId: number,
  item: Item,
  quantity: number
) => {
  const frameUrl = `${env.NEXT_PUBLIC_URL}/requests/${requestId}`;
  const text = `I'm looking for ${quantity} ${item.name} on /farville 🧑‍🌾`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    requestUrl: frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
      frameUrl
    )}&channelKey=farville`,
  };
};

export const shareWeeklyLeaderboardPositionComposeCastUrl = (
  fid: number,
  league: number,
  currentWeek: boolean
) => {
  const timestamp = Date.now();
  const frameUrl = `${env.NEXT_PUBLIC_URL}/flex-card/leaderboard/${fid}/${timestamp}/weekly?currentWeek=${currentWeek}`;

  const text = `Yo farmers! Check my ${
    currentWeek ? "current" : "last"
  } week performance in the weekly ${
    league === 1 ? "Wood" : league === 2 ? "Iron" : "Gold"
  } League leaderboard! 🚜💨`;

  const urlFriendlyText = encodeURIComponent(text);
  return {
    frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
      frameUrl
    )}&channelKey=farville`,
  };
};

export const streakFlexCardComposeCastUrl = (
  fid: number,
  streakNumber: number
) => {
  const timestamp = Date.now();
  const frameUrl = `${env.NEXT_PUBLIC_URL}/flex-card/streak/${fid}/${timestamp}`;
  const text = `yo farmers, look here! my /farville streak is ${streakNumber} 🔥 LFF 🚜💨🚜💨`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
      frameUrl
    )}&channelKey=farville`,
  };
};

export const mintedOgFlexCardComposeCastUrl = (fid: number) => {
  const timestamp = Date.now();
  const frameUrl = `${env.NEXT_PUBLIC_URL}/flex-card/minted-og/${fid}/${timestamp}`;
  const text = `I just minted my Farville OG NFT!\n\nbrum brum 🚜💨`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
      frameUrl
    )}&channelKey=farville`,
  };
};

export const mintedCollectibleFlexCardComposeCastUrl = (
  fid: number,
  collectibleId: string
) => {
  const timestamp = Date.now();
  const frameUrl = `${env.NEXT_PUBLIC_URL}/flex-card/collectibles/${fid}/${collectibleId}/${timestamp}`;
  const text = `mama, look — i’m a /farville farmer now!\n\nbrum brum 🚜💨`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
      frameUrl
    )}&channelKey=farville`,
  };
};

export const goldCropFlexCardComposeCastUrl = (fid: number, crop: string) => {
  const timestamp = Date.now();
  const frameUrl = `${env.NEXT_PUBLIC_URL}/flex-card/gold-crop/${fid}/${timestamp}?crop=${crop}`;
  const text = `I just harvested a new gold crop!\n\nbrum brum 🚜💨`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
      frameUrl
    )}&channelKey=farville`,
  };
};

export const achievementBadgeFlexCardComposeCastUrl = (
  fid: number,
  crop: string,
  step: number,
  badgeTitle: string
) => {
  const timestamp = Date.now();
  const frameUrl = `${env.NEXT_PUBLIC_URL}/flex-card/achievement/${fid}/${timestamp}?crop=${crop}&step=${step}`;
  const text = `I've reached the ${badgeTitle} level for the ${crop} crop!\n\nbrum brum 🚜💨`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
      frameUrl
    )}&channelKey=farville`,
  };
};

export const leaderboardFlexCardComposeCastUrl = (
  fid: number,
  type: "quests" | "xp",
  isFriends: boolean
) => {
  const timestamp = Date.now();
  const frameUrl = `${
    env.NEXT_PUBLIC_URL
  }/flex-card/leaderboard/${fid}/${timestamp}${
    isFriends ? "" : "/short"
  }?friends=${isFriends}&quests=${type === "quests"}`;

  const text =
    type === "quests"
      ? `yo farmers! crushing ${
          isFriends ? "friends" : "global"
        } quests on /farville! 🧑‍🌾 LFF 🚜💨`
      : `peep my XP gains on /farville! 🌱 ${
          isFriends ? "friends" : "global"
        } leaderboard flex! LFF 🚜💨`;

  const urlFriendlyText = encodeURIComponent(text);

  return {
    frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
      frameUrl
    )}&channelKey=farville`,
  };
};

export const getCurrentLevelAndProgress = (experience: number) => {
  const currentLevel = LEVEL_XP_THRESHOLDS.findIndex(
    (threshold) => experience < threshold
  );

  // If XP is above all thresholds, use the max level
  if (currentLevel === -1) {
    const maxLevel = LEVEL_XP_THRESHOLDS.length;
    return {
      currentLevel: maxLevel,
      progress: 100,
    };
  }

  const previousLevelXP = LEVEL_XP_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelXP = LEVEL_XP_THRESHOLDS[currentLevel];
  const progress =
    ((experience - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100;
  return { currentLevel, progress };
};

export const getUserLeague = (experience: number) => {
  const { currentLevel } = getCurrentLevelAndProgress(experience);

  if (currentLevel < 5) {
    return 0;
  } else if (currentLevel < 10) {
    return 1;
  } else if (currentLevel < 15) {
    return 2;
  }
  return 3;
};

export const getLevelThresholdLeagueByLeague = (league: number) => {
  if (league === 0) {
    return 1;
  } else if (league === 1) {
    return 5;
  } else if (league === 2) {
    return 10;
  }
  return 15;
};

export const chooseRandomItem = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

export const formatTime = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    secs > 0 ? `${secs}s` : `0s`,
  ]
    .filter(Boolean)
    .join(" ");
};

export const getBoostTime = (perkSlug: PerkType, mode: Mode) => {
  return (
    Math.floor(
      SPEED_BOOST[perkSlug].duration / MODE_DEFINITIONS[mode].growthTimeDivisor
    ) *
    (1 - 1 / SPEED_BOOST[perkSlug].boost)
  );
};

// TODO: duration needs to be calculated based on the mode using a different operation
export const isBoostable = (
  itemSlug: string,
  mode: Mode,
  lastBoostTime: Date
) => {
  const timeSinceBoost = Date.now() - lastBoostTime.getTime();
  return (
    timeSinceBoost <
    Math.floor(
      SPEED_BOOST[itemSlug].duration / MODE_DEFINITIONS[mode].boosterTimeDivisor
    )
  );
};

export const getStreakDates = (streaks: Streak[]) => {
  const dates: Date[] = [];

  streaks.forEach((streak) => {
    if (streak.endedAt) {
      const startDate = new Date(streak.startedAt);
      const endDate = new Date(streak.endedAt);
      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    } else {
      const startDate = new Date(streak.startedAt);
      const lastActionDate = new Date(streak.lastActionAt);
      for (let d = startDate; d <= lastActionDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    }
  });

  return dates;
};

export const getCurrentDayStreak = (streak?: Streak, frostsDays?: Date[]) => {
  if (!streak || streak.endedAt) {
    return 0;
  }
  const totalFrostsDays = frostsDays ? frostsDays.length : 0;
  const startDate = new Date(streak.startedAt);
  const lastActionDate =
    frostsDays && frostsDays.length > 0
      ? new Date(
          Math.max(
            new Date(streak.lastActionAt).getTime(),
            new Date(frostsDays[frostsDays.length - 1]).getTime()
          )
        )
      : new Date(streak.lastActionAt);
  const differenceInTime = lastActionDate.getTime() - startDate.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  return differenceInDays + 1 - totalFrostsDays;
};

export const calculateHarvestAchievements = (
  userHarvestedCrops: UserHarvestedCrop[]
) => {
  let totalAchievements = 0;
  let totalAchievementsCompleted = 0;
  // calculate the achievements status based on the user's harvested crops and the thresholds
  const harvestAchievements = ACHIEVEMENTS_THRESHOLDS.map((threshold) => {
    const progress = getAchievementProgressByCrop(
      userHarvestedCrops,
      threshold.crop
    );
    totalAchievements += threshold.thresholds.length;
    totalAchievementsCompleted += progress.step - 1;

    // Calculate current count by subtracting previous threshold
    const previousThreshold =
      progress.step > 1 ? threshold.thresholds[progress.step - 2] : 0;
    const currentCount = progress.count - previousThreshold;

    return {
      step: progress.step,
      crop: threshold.crop,
      title: threshold.titles[progress.step - 1],
      totalCount: progress.count,
      currentCount,
      currentGoal: progress.currentGoal,
    };
  });

  return {
    totalAchievements,
    totalAchievementsCompleted,
    harvestAchievements,
  };
};

export const getAchievementProgressByCrop = (
  userHarvestedCrops: UserHarvestedCrop[],
  crop: CropType
) => {
  const cropAchievement = ACHIEVEMENTS_THRESHOLDS.find(
    (threshold) => threshold.crop === crop
  );

  if (!cropAchievement) {
    throw new Error(`Achievement thresholds not found for crop ${crop}`);
  }

  const count =
    userHarvestedCrops.find((crop) => crop.crop === cropAchievement.crop)
      ?.quantity || 0;

  let achievementStep = 1;

  for (const goal of cropAchievement.thresholds) {
    if (count < goal) {
      return {
        step: achievementStep,
        count,
        currentGoal: goal,
      };
    } else {
      achievementStep++;
    }
  }

  return {
    step: achievementStep,
    count,
    currentGoal:
      cropAchievement.thresholds[cropAchievement.thresholds.length - 1],
  };
};

export const calculateGoldCropsInBatch = (
  amount: number,
  achievementStep: number,
  basePercentage: number = BASE_GOLD_CROP_PERCENTAGE
): number => {
  // Increase chance based on achievement step (2.5x for each step above 1)
  const percentage =
    achievementStep > 1
      ? basePercentage * (achievementStep - 1) * ACHIEVEMENTS_GOLD_MULTIPLIER
      : basePercentage;

  // Generate all random rolls at once
  const rolls = Array.from({ length: amount }, () => Math.random());

  // Count how many rolls are below the threshold
  return rolls.filter((roll) => roll < percentage).length;
};

export const getPartialLeaderboardBasedOnFid = async (
  targetFid: string,
  mode: Mode,
  options: {
    friends: boolean;
    type: "quests" | "xp";
    limit: number;
  }
) => {
  const user = await getUserByMode(Number(targetFid), mode);

  if (!user) {
    throw new Error("Failed to fetch leaderboard: user not found");
  }

  if (options.friends && targetFid) {
    // Optimize followed users fetch with proper pagination
    const followedUsers = await fetchUsersFollowedBy(
      targetFid,
      500,
      "desc_chron"
    );
    const followedFids = followedUsers.map((user) => user.fid.toString());
    const userFids = [...new Set(followedFids.concat(targetFid))]; // Remove duplicates

    if (options.type === "quests") {
      const users = await getQuestPartialLeaderboardFromFids({
        fids: userFids,
        targetFid,
        mode,
        limit: Number(options.limit),
      });
      return users;
    }

    const users = await getModePartialLeaderboardFromFids(
      userFids,
      targetFid,
      Number(options.limit)
    );
    return users;
  }

  // Default behavior with caching
  if (options.type === "quests") {
    const users = await getQuestPartialLeaderboard({
      targetFid: targetFid,
      mode,
      limit: Number(options.limit),
    });
    return users;
  }

  const userPosition = await getLeaderboardUserPositionByMode(user.xp);
  console.log(`User ${targetFid} position is: ${userPosition}`);
  const partialLeaderboard = await getModePartialLeaderboardFromUserPosition(
    userPosition,
    Number(options.limit)
  );

  return partialLeaderboard;
};

export const getGlobalLeaderboard = async (
  targetFid: string,
  mode: Mode,
  type: "quests" | "xp" = "xp",
  limit: number = 20
) => {
  let users;
  if (type === "quests") {
    users = await getQuestLeaderboard({
      limit,
      targetFid: targetFid ? targetFid : undefined,
      mode,
    });
  } else {
    users = await getUsersByXp(
      limit,
      targetFid ? Number(targetFid) : undefined
    );
  }
  return users;
};

export const getThisWeekMonday = () => {
  const now = new Date();

  // Get the day of the week (0 is Sunday, 1 is Monday, ..., 6 is Saturday)
  const day = now.getUTCDay();

  // Calculate how many days to subtract to get to Monday
  const diffToMonday = (day + 6) % 7; // Converts Sunday (0) to 6, Monday (1) to 0, etc.

  // Get Monday at 00:00 UTC
  const monday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - diffToMonday,
      0,
      0,
      0,
      0
    )
  );

  return monday;
};

export const getPfpNftTxCalldata = (params: {
  address: Address;
  fid: bigint;
  priceInUSD: number;
  pinataMetadataCID: string;
  backendSignature: Hex;
}) => {
  const priceInUSDCbigint = BigInt(params.priceInUSD * 10 ** 6);
  return encodeFunctionData({
    abi: PFP_NFT_ABI,
    functionName: "mint",
    args: [
      params.address,
      params.fid,
      priceInUSDCbigint,
      params.pinataMetadataCID,
      params.backendSignature,
    ],
  });
};

export const userCanDonate = (
  donationsLast24h: DbUserDonation[],
  receiver: number
) => {
  const lastDonationToReceiver = donationsLast24h.find(
    (d) => d.receiverFid === receiver
  );
  const canDonateToReceiver =
    !lastDonationToReceiver ||
    (lastDonationToReceiver &&
      lastDonationToReceiver?.times !== null &&
      lastDonationToReceiver.times < MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS);
  const canDonateToAnotherUser =
    donationsLast24h.length < MAX_DAILY_ALLOWED_DONATION_TO_USERS;
  return {
    canDonateToReceiver,
    canDonateToAnotherUser,
    lastDonationToReceiver,
  };
};

export const getGrowthTimeBasedOnMode = (crop: CropType, mode: Mode) => {
  const baseGrowthTime = CROP_DATA[crop].growthTime;
  return Math.floor(baseGrowthTime / MODE_DEFINITIONS[mode].growthTimeDivisor);
};

export const initQuestsAndLeaderboardEntryByMode = async (
  fid: number,
  mode: Mode
) => {
  const modeFeatures = MODE_DEFINITIONS[mode].features;

  if (modeFeatures.includes(ModeFeature.Leagues)) {
    // generate new entry inside the user leaderboard if it doesn't exist
    let userLeaderboardEntry = await getUserLeaderboardEntry(Number(fid), mode);

    if (!userLeaderboardEntry) {
      const user = await getUserByMode(Number(fid), mode);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      const userLeague = getUserLeague(user.xp);
      userLeaderboardEntry = await createUserLeaderboardEntry(
        Number(fid),
        {
          league: userLeague,
        },
        mode
      );
    }
  }

  if (modeFeatures.includes(ModeFeature.Quests)) {
    // Check if the user has daily, weekly and monthly quests
    // If not, initialize them
    const dailyQuests = await getUserHasQuests(Number(fid), mode, {
      type: [QuestType.Daily],
      activeToday: true,
    });
    const weeklyQuests = await getUserHasQuests(Number(fid), mode, {
      type: [QuestType.Weekly],
      activeToday: true,
    });
    console.log(
      `User ${fid} has ${dailyQuests.length} daily quests and ${weeklyQuests.length} weekly quests in mode ${mode}`
    );
    if (!dailyQuests || dailyQuests?.length === 0) {
      await initDailyUserQuests(Number(fid), mode);
    }
    if (!weeklyQuests || weeklyQuests?.length === 0) {
      await initWeeklyUserQuests(Number(fid), mode);
    }
  }
};

export const initQuestsAndLeaderboardEntry = async (
  fid: number,
  modes: Mode[]
) => {
  for (const mode of modes) {
    const now = new Date();
    const modeStartDate = MODE_DEFINITIONS[mode].startDate;
    const modeEndDate = MODE_DEFINITIONS[mode].endDate;
    if (
      modeStartDate &&
      modeEndDate &&
      // mode !== Mode.Classic &&
      (now < modeStartDate || now > modeEndDate)
    ) {
      continue;
    }
    console.log(
      `Initializing quests and leaderboard entry for fid ${fid} in mode ${mode}`
    );
    await initQuestsAndLeaderboardEntryByMode(fid, mode);
  }
};
