import { Item, Quest, Prisma } from "@prisma/client";
import { prisma } from "../client";
import {
  CropType,
  Mode,
  PerkType,
  QuestStatus,
  QuestType,
} from "@/lib/types/game";
import { getUserByMode } from "./user-statistic";
import { getUserLeaderboardEntry } from "./user-leaderboard-entry";
import {
  chooseRandomItem,
  getBoostTime,
  getLevelThresholdLeagueByLeague,
} from "@/lib/utils";
import { createUserQuest } from "./user-has-quest";
import { getItemsByCategory } from "./item";
import {
  CROP_DATA,
  CropData,
  DAILY_QUESTS_NUMBER,
  EXPANSION_COSTS,
  millisecondsInHour,
  WEEKLY_QUESTS_NUMBER,
} from "@/lib/game-constants";
import { getCurrentCommunityBooster } from "./user-community-booster-history";

export const getActiveQuests = async (): Promise<
  (Quest & { item: Item | null })[]
> => {
  const now = new Date();
  const quests = await prisma.quest.findMany({
    where: {
      startAt: { lte: now },
      endAt: { gt: now },
    },
    include: {
      item: true,
    },
    orderBy: {
      endAt: "asc",
    },
  });

  return quests;
};

export const getQuestById = async (id: number): Promise<Quest | null> => {
  const quest = await prisma.quest.findUnique({
    where: { id },
  });

  return quest;
};

export const createQuests = async (
  quests: Prisma.QuestCreateInput[]
): Promise<Quest[]> => {
  return await prisma.quest.createManyAndReturn({
    data: quests,
    skipDuplicates: true, // Optional: skips duplicates if needed
  });
};

export const getQuestsByTypeAndLevel = async (
  type: QuestType,
  level: number,
  mode: Mode
): Promise<Quest[]> => {
  const now = new Date();
  const data = await prisma.quest.findMany({
    where: {
      mode,
      type,
      level,
      startAt: { lte: now },
      endAt: { gt: now },
    },
    orderBy: {
      endAt: "asc",
    },
  });

  return data;
};

export const initDailyUserQuests = async (
  fid: number,
  mode: Mode,
  quantity: number
): Promise<void> => {
  // get user level
  const user = await getUserByMode(fid, mode);
  if (!user) {
    throw new Error("User not found");
  }

  const userLeague = (await getUserLeaderboardEntry(fid, mode))?.league || 0;

  const thresholdLevel = getLevelThresholdLeagueByLeague(userLeague);

  let dailyQuests: Quest[] = await getQuestsByTypeAndLevel(
    QuestType.Daily,
    thresholdLevel,
    mode
  );

  if (!dailyQuests || dailyQuests.length < DAILY_QUESTS_NUMBER) {
    dailyQuests = await generateDailyQuests(thresholdLevel, mode, quantity);
  }

  await Promise.all(
    dailyQuests.map((quest) =>
      createUserQuest({
        fid,
        questId: quest.id,
        completedAt: null,
        status: QuestStatus.Incomplete,
        progress: 0,
      })
    )
  );
};

export const initWeeklyUserQuests = async (
  fid: number,
  mode: Mode,
  quantity: number
): Promise<void> => {
  // get user level
  const user = await getUserByMode(fid, mode);
  if (!user) {
    throw new Error("User not found");
  }

  const userLeague = (await getUserLeaderboardEntry(fid, mode))?.league || 0;

  const thresholdLevel = getLevelThresholdLeagueByLeague(userLeague);

  let weeklyQuests: Quest[] = await getQuestsByTypeAndLevel(
    QuestType.Weekly,
    thresholdLevel,
    mode
  );

  if (!weeklyQuests || weeklyQuests.length < WEEKLY_QUESTS_NUMBER) {
    weeklyQuests = await generateWeeklyQuests(thresholdLevel, mode, quantity);
  }

  await Promise.all(
    weeklyQuests.map((quest) =>
      createUserQuest({
        fid,
        questId: quest.id,
        completedAt: null,
        status: QuestStatus.Incomplete,
        progress: 0,
      })
    )
  );
};

export const generateDailyQuests = async (
  level: number,
  mode: Mode,
  quantity: number
) => {
  let questCategories = ["sell", "receive", "donate", "plant", "harvest"];

  // TODO: optimize this to not access the database multiple times
  let seedItems = (await getItemsByCategory("seed")).filter(
    (item) => item.requiredLevel <= level
  );
  let cropItems = (await getItemsByCategory("crop")).filter(
    (item) => item.requiredLevel <= level
  );

  const amounts = [3, 4, 5, 6, 7, 8];

  const dailyQuests: Prisma.QuestCreateArgs["data"][] = [];
  for (let i = 0; i < quantity; i++) {
    const category = chooseRandomItem(questCategories);
    questCategories = questCategories.filter((c) => c !== category);
    let item: Item;
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
    // const startAtISO = startAt.toISOString();
    const endAt = new Date();
    endAt.setUTCHours(23, 59, 59, 999);
    // const endAtISO = endAt.toISOString();

    const dailyQuest: Prisma.QuestCreateArgs["data"] = {
      type: "daily",
      mode,
      category,
      itemId: item.id,
      amount,
      xp,
      startAt: startAt,
      endAt: endAt,
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

export const calculateValidAmount = async (
  crop: CropData,
  level: number,
  mode: Mode,
  questTimeInHours: number = 40
) => {
  const userAvailableCells =
    (EXPANSION_COSTS.filter((cost) => cost.level <= level).pop()?.nextSize
      .width ?? 2) ** 2;

  const currentCommunityBoost = await getCurrentCommunityBooster(mode);

  let bonusTime = 0;
  // TODO: see if we can refactor this to be more clear without using static ids
  if ([17, 5, 18].includes(crop.id)) {
    bonusTime = getBoostTime(
      PerkType.Nitrogen,
      mode,
      currentCommunityBoost?.stage || 1
    );
  } else if ([19, 8, 20, 21, 7].includes(crop.id)) {
    bonusTime = getBoostTime(
      PerkType.Potassium,
      mode,
      currentCommunityBoost?.stage || 1
    );
  } else if ([22, 6, 23].includes(crop.id)) {
    bonusTime = getBoostTime(
      PerkType.Phosphorus,
      mode,
      currentCommunityBoost?.stage || 1
    );
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

export const generateWeeklyQuests = async (
  level: number,
  mode: Mode,
  quantity: number
) => {
  let questCategories = ["sell", "plant", "harvest"];

  let seedItems = (await getItemsByCategory("seed")).filter(
    (item) =>
      item.requiredLevel <= level && item.slug !== CropType.Pumpkin + "-seeds"
  );
  let cropItems = (await getItemsByCategory("crop")).filter(
    (item) => item.requiredLevel <= level && item.slug !== CropType.Pumpkin
  );

  // const amounts = [10, 15, 20, 25, 30];

  const weeklyQuests: Prisma.QuestCreateArgs["data"][] = [];
  for (let i = 0; i < quantity; i++) {
    const category = chooseRandomItem(questCategories);
    questCategories = questCategories.filter((c) => c !== category);
    let item: Item;
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
    const amount =
      Math.round((await calculateValidAmount(cropData, level, mode)) / 10) * 10;

    const xp = calculateQuestXP(level, cropData, amount);
    const startAt = new Date();
    startAt.setUTCHours(0, 0, 0, 0);
    const startAtISO = startAt.toISOString();
    const endAt = new Date();
    endAt.setUTCDate(endAt.getUTCDate() + (7 - endAt.getUTCDay()));
    endAt.setUTCHours(23, 59, 59, 999);
    const endAtISO = endAt.toISOString();

    const weeklyQuest: Prisma.QuestCreateArgs["data"] = {
      type: "weekly",
      mode,
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

export const calculateQuestXP = (
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
