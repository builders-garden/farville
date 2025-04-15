// we generate 3 quests
// - choose randomly the quest type from commonQuestCategories, but no duplicates in the same day
// - choose randomly the item from seedItems or cropItems, depending on the quest type
// - choose randomly the amount from amounts
// - calculate the xp reward based on the amount
// - start at the beginning of the day, end at the end of the day
//   - so if it's currently 10:00, the quest will be from 00:00 to 23:59 UTC of the current day

import {
  CROP_DATA,
  EXPANSION_COSTS,
  millisecondsInHour,
  CropData,
} from "@/lib/game-constants";
import { chooseRandomItem, getBoostTime } from "@/lib/utils";
import { CropType, PerkType } from "@/lib/types/game";
import { createQuests, getItemsByCategory } from "./queries";
import { InsertDbQuest, DbItem } from "./types";

// - create the quest
export const generateDailyQuests = async (level: number) => {
  let questCategories = ["sell", "receive", "donate", "plant", "harvest"];

  let seedItems = (await getItemsByCategory("seed")).filter(
    (item) => item.requiredLevel <= level
  );
  let cropItems = (await getItemsByCategory("crop")).filter(
    (item) => item.requiredLevel <= level
  );

  const amounts = [3, 4, 5, 6, 7, 8];

  const dailyQuests: InsertDbQuest[] = [];
  for (let i = 0; i < 3; i++) {
    const category = chooseRandomItem(questCategories);
    questCategories = questCategories.filter((c) => c !== category);
    let item: DbItem;
    if (category === "plant") {
      item = chooseRandomItem(seedItems);
    } else if (category === "sell") {
      item = chooseRandomItem(cropItems);
    } else if (category === "harvest") {
      item = chooseRandomItem(
        cropItems.filter(
          (i) =>
            i.slug !== CropType.Strawberry &&
            i.slug !== CropType.Watermelon &&
            i.slug !== CropType.Pumpkin
        )
      );
    } else {
      const allItems = [...seedItems, ...cropItems];
      item = chooseRandomItem(allItems);
    }
    seedItems = seedItems.filter((i) => i.id !== item.id);
    cropItems = cropItems.filter((i) => i.id !== item.id);
    const slugToUse =
      item.category === "crop" ? item.slug : item.slug.split("-")[0];
    const cropData = CROP_DATA[slugToUse];

    const amount = chooseRandomItem(amounts);

    const xp = calculateQuestXP(level, cropData, amount);
    const startAt = new Date();
    startAt.setUTCHours(0, 0, 0, 0);
    const startAtISO = startAt.toISOString();
    const endAt = new Date();
    endAt.setUTCHours(23, 59, 59, 999);
    const endAtISO = endAt.toISOString();

    const dailyQuest: InsertDbQuest = {
      type: "daily",
      category,
      itemId: item.id,
      amount,
      xp,
      startAt: startAtISO,
      endAt: endAtISO,
      coins: 0,
      level,
    };

    dailyQuests.push(dailyQuest);
  }

  const insertedQuests = await createQuests(dailyQuests);
  return insertedQuests;
};

function maxPerksApplicationsByCrop(
  initialGrowthTime: number,
  bonusTime: number
): number {
  // Start with the first application at time 0.
  // Let k be the number of applications.
  let k = 1;

  // Loop until the next application time is no longer valid.
  while (true) {
    // The time for the k-th application (first is at time 0)
    const applicationTime = (k - bonusTime) * 2;
    // The watermelon will be ready at time: initialGrowthTime - k (since each application reduces the growth time by 1 hour)
    const adjustedGrowthTime = initialGrowthTime - k;

    // Check if applying at applicationTime is still before the watermelon has matured.
    if (applicationTime >= adjustedGrowthTime) {
      break;
    }
    k++;
  }

  // Return the maximum valid number of applications.
  return k - 1;
}

const calculateValidAmount = (crop: CropData, level: number) => {
  const questTimeInHours = 40;
  const userAvailableCells =
    (EXPANSION_COSTS.filter((cost) => cost.level <= level).pop()?.nextSize
      .width ?? 2) ** 2;

  let bonusTime = 0;
  // TODO: see if we can refactor this to be more clear without using static ids
  if ([17, 5, 18].includes(crop.id)) {
    bonusTime = getBoostTime(PerkType.Nitrogen);
  } else if ([19, 8, 20, 21, 7].includes(crop.id)) {
    bonusTime = getBoostTime(PerkType.Potassium);
  } else if ([22, 6, 23].includes(crop.id)) {
    bonusTime = getBoostTime(PerkType.Phosphorus);
  }
  bonusTime = bonusTime / millisecondsInHour;
  const cropGrowthTime = crop.growthTime / millisecondsInHour;

  const maxPerksApplications = maxPerksApplicationsByCrop(
    cropGrowthTime,
    bonusTime
  );

  const acceleratedGrowthTime =
    cropGrowthTime - maxPerksApplications * bonusTime;
  const cyclesPerCell = Math.floor(questTimeInHours / acceleratedGrowthTime);
  const maxAmount = cyclesPerCell * userAvailableCells;

  return maxAmount;
};

export const generateWeeklyQuests = async (level: number) => {
  let questCategories = ["sell", "plant", "harvest"];

  let seedItems = (await getItemsByCategory("seed")).filter(
    (item) =>
      item.requiredLevel <= level && item.slug !== CropType.Pumpkin + "-seeds"
  );
  let cropItems = (await getItemsByCategory("crop")).filter(
    (item) => item.requiredLevel <= level && item.slug !== CropType.Pumpkin
  );

  // const amounts = [10, 15, 20, 25, 30];

  const weeklyQuests: InsertDbQuest[] = [];
  for (let i = 0; i < 3; i++) {
    const category = chooseRandomItem(questCategories);
    questCategories = questCategories.filter((c) => c !== category);
    let item: DbItem;
    if (category === "plant") {
      item = chooseRandomItem(seedItems);
    } else if (category === "sell") {
      item = chooseRandomItem(cropItems);
    } else if (category === "harvest") {
      item = chooseRandomItem(cropItems);
    } else {
      const allItems = [...seedItems, ...cropItems];
      item = chooseRandomItem(allItems);
    }
    seedItems = seedItems.filter(
      (i) =>
        i.slug !==
        (item.slug.includes("-seeds") ? item.slug : item.slug + "-seeds")
    );
    cropItems = cropItems.filter(
      (i) =>
        i.slug !==
        (item.slug.includes("-seeds") ? item.slug.split("-")[0] : item.slug)
    );
    const slugToUse =
      item.category === "crop" ? item.slug : item.slug.split("-")[0];
    const cropData = CROP_DATA[slugToUse];

    // Apply level-based multiplier for quest amount
    // and round the amount to the lowest 10 multiple
    // const amount =
    //   Math.round(Math.floor(chooseRandomItem(amounts) * level * 0.5) / 10) * 10;

    const amount = Math.round(calculateValidAmount(cropData, level) / 10) * 10;

    const xp = calculateQuestXP(level, cropData, amount);
    const startAt = new Date();
    startAt.setUTCHours(0, 0, 0, 0);
    const startAtISO = startAt.toISOString();
    const endAt = new Date();
    endAt.setUTCDate(endAt.getUTCDate() + (7 - endAt.getUTCDay()));
    endAt.setUTCHours(23, 59, 59, 999);
    const endAtISO = endAt.toISOString();

    const weeklyQuest: InsertDbQuest = {
      type: "weekly",
      category,
      itemId: item.id ? item.id : cropItems[0].id,
      amount,
      xp,
      startAt: startAtISO,
      endAt: endAtISO,
      coins: 0,
      level,
    };

    weeklyQuests.push(weeklyQuest);
  }

  const insertedQuests = await createQuests(weeklyQuests);
  return insertedQuests;
};

export const generateMonthlyQuests = async (level: number) => {
  let questCategories = ["sell", "receive", "donate", "plant", "harvest"];

  let seedItems = (await getItemsByCategory("seed")).filter(
    (item) => item.requiredLevel <= level
  );
  let cropItems = (await getItemsByCategory("crop")).filter(
    (item) => item.requiredLevel <= level
  );

  // const amounts = [40, 60, 80, 100, 120];
  const amountsByTier = {
    S: [100, 120, 150],
    A: [200, 225, 250],
    B: [300, 350, 400],
    C: [500, 550, 600],
  };

  const monthlyQuests: InsertDbQuest[] = [];
  for (let i = 0; i < 5; i++) {
    const category = chooseRandomItem(questCategories);
    questCategories = questCategories.filter((c) => c !== category);
    let item: DbItem;
    if (category === "plant") {
      item = chooseRandomItem(seedItems);
    } else if (category === "sell") {
      item = chooseRandomItem(cropItems);
    } else if (category === "harvest") {
      item = chooseRandomItem(cropItems);
    } else {
      const allItems = [...seedItems, ...cropItems];
      item = chooseRandomItem(allItems);
    }
    seedItems = seedItems.filter((i) => i.id !== item.id);
    cropItems = cropItems.filter((i) => i.id !== item.id);
    const slugToUse =
      item.category === "crop" ? item.slug : item.slug.split("-")[0];
    const cropData = CROP_DATA[slugToUse];

    // const amount = chooseRandomItem(amounts);
    // Apply level-based multiplier for quest amount
    const amount = chooseRandomItem(
      amountsByTier[cropData.tier as keyof typeof amountsByTier]
    );

    const xp = calculateQuestXP(level, cropData, amount);
    const startAt = new Date();
    startAt.setUTCHours(0, 0, 0, 0);
    const startAtISO = startAt.toISOString();
    const endAt = new Date();
    endAt.setUTCDate(1);
    endAt.setUTCMonth(endAt.getUTCMonth() + 1);
    endAt.setUTCDate(0);
    endAt.setUTCHours(23, 59, 59, 999);
    const endAtISO = endAt.toISOString();

    const monthlyQuest: InsertDbQuest = {
      type: "monthly",
      category,
      itemId: item.id ? item.id : cropItems[0].id,
      amount,
      xp,
      startAt: startAtISO,
      endAt: endAtISO,
      coins: 0,
      level,
    };

    monthlyQuests.push(monthlyQuest);
  }

  const insertedQuests = await createQuests(monthlyQuests);
  return insertedQuests;
};

const calculateQuestXP = (
  level: number,
  cropData: CropData,
  amount: number
): number => {
  const xpBonus: Record<"5" | "10" | "15" | "20", number> = {
    "5": 5,
    "10": 10,
    "15": 20,
    "20": 30,
  };

  const userCellsWidth =
    EXPANSION_COSTS.filter((cost) => cost.level <= level).pop()?.nextSize
      .width ?? 2;
  const userCellsBasedOnLevel = userCellsWidth * userCellsWidth;
  const T =
    (cropData.growthTime / millisecondsInHour) *
    Math.ceil(amount / userCellsBasedOnLevel);

  const bonusLevel = Object.keys(xpBonus)
    .filter((key) => Number(key) <= level)
    .pop();
  const bonusApplied = bonusLevel
    ? xpBonus[bonusLevel as keyof typeof xpBonus]
    : 0;

  const xpAmount =
    Math.ceil(
      (amount / cropData.power) *
        cropData.rewardXP *
        (1 + T / (CROP_DATA["pumpkin"].growthTime / millisecondsInHour))
    ) + bonusApplied;

  // return here the xpAmount rounded to the nearest integer value which is to be a multiple of 10 (if xpAmount < 1000) or 100 (if xpAmount >= 1000)
  if (xpAmount < 1000) {
    return Math.round(xpAmount / 10) * 10;
  } else {
    return Math.round(xpAmount / 100) * 100;
  }
};
