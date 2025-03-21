import { DbItem, DbStreak, DbUserHarvestedCrop } from "@/supabase/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ACHIEVEMENTS_GOLD_MULTIPLIER,
  ACHIEVEMENTS_THRESHOLDS,
  BASE_GOLD_CROP_PERCENTAGE,
  LEVEL_XP_THRESHOLDS,
  SPEED_BOOST,
} from "./game-constants";
import { CropType, PerkType } from "@/types/game";
import { LeaderboardResponse } from "@/hooks/use-leadeboard";
import { fetchUsersFollowedBy } from "./neynar";
import {
  getPartialLeaderboardFromFids,
  getPartialLeaderboardFromUserPosition,
  getQuestLeaderboard,
  getQuestPartialLeaderboard,
  getQuestPartialLeaderboardFromFids,
  getUser,
  getUserPosition,
  getUsersByXp,
} from "./prisma/queries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const warpcastComposeCastUrl = () => {
  const frameUrl = `${process.env.NEXT_PUBLIC_URL}`;
  const text = `I'm tired of touching grass IRL, and I can't wait to touch PIXEL grass in /farville...\n\nBuild my dream farm and grow quirky crops. It's honest work, but way more fun than real farming!🧑‍🌾`;
  const urlFriendlyText = encodeURIComponent(text);
  return `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${encodeURIComponent(
    frameUrl
  )}&channelKey=farville`;
};

export const requestItemComposeCastUrl = (
  requestId: number,
  item: DbItem,
  quantity: number
) => {
  const frameUrl = `${process.env.NEXT_PUBLIC_URL}/requests/${requestId}`;
  const text = `I'm looking for ${quantity} ${item.name} on /farville 🧑‍🌾`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    requestUrl: frameUrl,
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
  const frameUrl = `${process.env.NEXT_PUBLIC_URL}/flex-card/streak/${fid}/${timestamp}`;
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
  const frameUrl = `${process.env.NEXT_PUBLIC_URL}/flex-card/minted-og/${fid}/${timestamp}`;
  const text = `I just minted my Farville OG NFT!\n\nbrum brum 🚜💨`;
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
  const frameUrl = `${process.env.NEXT_PUBLIC_URL}/flex-card/gold-crop/${fid}/${timestamp}?crop=${crop}`;
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
  const frameUrl = `${process.env.NEXT_PUBLIC_URL}/flex-card/achievement/${fid}/${timestamp}?crop=${crop}&step=${step}`;
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
  isFriends: boolean,
  friendsData?: LeaderboardResponse
) => {
  const timestamp = Date.now();
  const frameUrl = `${
    process.env.NEXT_PUBLIC_URL
  }/flex-card/leaderboard/${fid}/${timestamp}${
    isFriends ? "" : "/short"
  }?friends=${isFriends}&quests=${type === "quests"}`;

  let text =
    type === "quests"
      ? `yo farmers! crushing ${
          isFriends ? "friends" : "global"
        } quests on /farville! 🧑‍🌾 LFF 🚜💨`
      : `peep my XP gains on /farville! 🌱 ${
          isFriends ? "friends" : "global"
        } leaderboard flex! LFF 🚜💨`;

  if (isFriends && friendsData) {
    const targetPosition =
      friendsData.targetPosition ??
      friendsData.users.findIndex((user) => user.fid === fid);

    const aboveUsers = friendsData.users
      .slice(0, targetPosition)
      .slice(-2)
      .map((user) => `@${user.username}`);

    const belowUsers = friendsData.users
      .slice(targetPosition + 1)
      .slice(0, 2)
      .map((user) => `@${user.username}`);

    // Add text for above users if they exist
    if (aboveUsers.length > 0) {
      text += `\n\ncoming for u ${aboveUsers.join(", ")} 👀`;
    }

    // Add text for below users if they exist
    if (belowUsers.length > 0) {
      text += `\n\nyou better catch up ${belowUsers.join(", ")}!!`;
    }
  }

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

export const getUserNowDate = () => {
  // This implementation is incorrect because:
  // 1. toLocaleString() output format is locale-dependent and unreliable
  // 2. Creating date string manually can lead to timezone issues
  // 3. The .000Z suffix forces UTC which may not match user's timezone

  // Instead, we should just return the current date:
  return new Date();
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

export const getBoostTime = (perkSlug: PerkType) => {
  return SPEED_BOOST[perkSlug].duration * (1 - 1 / SPEED_BOOST[perkSlug].boost);
};

export const getStreakDates = (streaks: DbStreak[]) => {
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

export const getCurrentDayStreak = (streak?: DbStreak, frostsDays?: Date[]) => {
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
  userHarvestedCrops: DbUserHarvestedCrop[]
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
  userHarvestedCrops: DbUserHarvestedCrop[],
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
  options: {
    friends: boolean;
    type: "quests" | "xp";
    limit: number;
  }
) => {
  const user = await getUser(Number(targetFid));

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
        limit: Number(options.limit),
      });
      return users;
    }

    const users = await getPartialLeaderboardFromFids(
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
      limit: Number(options.limit),
    });
    return users;
  }

  const userPosition = await getUserPosition(user.xp);
  console.log(`User ${targetFid} position is: ${userPosition}`);
  const partialLeaderboard = await getPartialLeaderboardFromUserPosition(
    userPosition,
    Number(options.limit)
  );

  return partialLeaderboard;
};

export const getGlobalLeaderboard = async (
  targetFid: string,
  type: "quests" | "xp" = "xp",
  limit: number = 20
) => {
  let users;
  if (type === "quests") {
    users = await getQuestLeaderboard({
      limit,
      targetFid: targetFid ? targetFid : undefined,
    });
  } else {
    users = await getUsersByXp(
      limit,
      targetFid ? Number(targetFid) : undefined
    );
  }
  return users;
};
