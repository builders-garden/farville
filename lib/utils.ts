import { DbItem } from "@/supabase/types";
import { LEVEL_XP_THRESHOLDS } from "./game-constants";

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
  const text = `I'm looking for ${quantity} ${item.name} on /farville🧑‍🌾`;
  const urlFriendlyText = encodeURIComponent(text);
  return `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${frameUrl}`;
};

export const getCurrentLevelAndProgress = (experience: number) => {
  const currentLevel = LEVEL_XP_THRESHOLDS.findIndex(
    (threshold) => experience < threshold
  );
  const previousLevelXP = LEVEL_XP_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelXP = LEVEL_XP_THRESHOLDS[currentLevel];
  const progress =
    ((experience - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100;
  return { currentLevel, progress };
};
