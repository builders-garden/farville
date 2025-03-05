import { DbItem, DbStreak } from "@/supabase/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LEVEL_XP_THRESHOLDS, SPEED_BOOST } from "./game-constants";
import { PerkType } from "@/types/game";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const warpcastComposeCastUrl = () => {
  const frameUrl = `https://farville.farm`;
  const text = `I'm tired of touching grass IRL, and I can't wait to touch PIXEL grass in /farville...\n\nBuild my dream farm and grow quirky crops. It's honest work, but way more fun than real farming!🧑‍🌾`;
  const urlFriendlyText = encodeURIComponent(text);
  return `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${frameUrl}`;
};

export const requestItemComposeCastUrl = (
  requestId: number,
  item: DbItem,
  quantity: number
) => {
  const frameUrl = `https://farville.farm/requests/${requestId}`;
  const text = `I'm looking for ${quantity} ${item.name} on /farville 🧑‍🌾`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    requestUrl: frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${frameUrl}`,
  };
};

export const streakFlexCardComposeCastUrl = (
  fid: number,
  streakNumber: number
) => {
  const timestamp = Date.now();
  const frameUrl = `https://farville.farm/flex-card/streak/${fid}/${timestamp}`;
  const text = `yo farmers, look here! my /farville streak is ${streakNumber} 🔥 LFF 🚜💨🚜💨`;
  const urlFriendlyText = encodeURIComponent(text);
  return {
    frameUrl,
    castUrl: `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${frameUrl}`,
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
