import { GAME_ITEMS } from "@/lib/game-constants";

interface PrizeConfig {
  amount: number;
  icon?: string;
  unit?: string;
}

interface PrizeBreakdown {
  range: string;
  prize: PrizeConfig;
}

interface LeaguePrizes {
  total: string;
  first: PrizeConfig;
  second: PrizeConfig;
  third: PrizeConfig;
  description: string;
  breakdown: PrizeBreakdown[];
}

const getItemIcon = (slug: string) =>
  GAME_ITEMS.find((item) => item.slug === slug)?.icon;

export const LEAGUE_PRIZES: Record<number, LeaguePrizes> = {
  3: {
    total: "63 USDC",
    first: { amount: 8, unit: "USDC" },
    second: { amount: 6, unit: "USDC" },
    third: { amount: 4, unit: "USDC" },
    description:
      "The reward for the Gold League is 50 USDC pool divided as follows:",
    breakdown: [
      { range: "1st", prize: { amount: 8, unit: "USDC" } },
      { range: "2nd", prize: { amount: 6, unit: "USDC" } },
      { range: "3rd", prize: { amount: 4, unit: "USDC" } },
      { range: "4-10th", prize: { amount: 2, unit: "USDC" } },
      { range: "11-25th", prize: { amount: 1.25, unit: "USDC" } },
      { range: "26-50th", prize: { amount: 0.5, unit: "USDC" } },
    ],
  },
  2: {
    total: "Perks/Seeds",
    first: { amount: 5, icon: getItemIcon("fertilizer") },
    second: { amount: 3, icon: getItemIcon("fertilizer") },
    third: { amount: 25, icon: getItemIcon("pumpkin-seeds") },
    description:
      "The reward for the Iron League are perks give away as follows:",
    breakdown: [
      { range: "1st", prize: { amount: 5, icon: getItemIcon("fertilizer") } },
      { range: "2nd", prize: { amount: 3, icon: getItemIcon("fertilizer") } },
      {
        range: "3rd",
        prize: { amount: 25, icon: getItemIcon("pumpkin-seeds") },
      },
      {
        range: "4-10th",
        prize: { amount: 10, icon: getItemIcon("pumpkin-seeds") },
      },
      {
        range: "11-25th",
        prize: { amount: 30, icon: getItemIcon("phosphorus") },
      },
      {
        range: "26-50th",
        prize: { amount: 25, icon: getItemIcon("potassium") },
      },
    ],
  },
  1: {
    total: "Crops/Seeds",
    first: { amount: 20, icon: getItemIcon("pumpkin-seeds") },
    second: { amount: 10, icon: getItemIcon("pumpkin-seeds") },
    third: { amount: 30, icon: getItemIcon("strawberry") },
    description:
      "The reward for the Wood League is a crops give away as follows:",
    breakdown: [
      {
        range: "1st",
        prize: { amount: 20, icon: getItemIcon("pumpkin-seeds") },
      },
      {
        range: "2nd",
        prize: { amount: 10, icon: getItemIcon("pumpkin-seeds") },
      },
      { range: "3rd", prize: { amount: 30, icon: getItemIcon("strawberry") } },
      { range: "4-10th", prize: { amount: 20, icon: getItemIcon("tomato") } },
      { range: "11-25th", prize: { amount: 15, icon: getItemIcon("potato") } },
      { range: "26-50th", prize: { amount: 15, icon: getItemIcon("corn") } },
    ],
  },
} as const;
