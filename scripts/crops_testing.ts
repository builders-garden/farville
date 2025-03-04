import {
  CROP_DATA,
  EXPANSION_COSTS,
  CropData,
  SPEED_BOOST,
  millisecondsInHour,
  CropType,
  PerkType,
} from "./constants";

const getBoostTime = (perkSlug: PerkType) => {
  return SPEED_BOOST[perkSlug].duration * (1 - 1 / SPEED_BOOST[perkSlug].boost);
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

const main = () => {
  const level = 17;
  console.log(`User at level: ${level}\n`);
  Object.values(CropType).forEach((cropSlug) => {
    const cropData = CROP_DATA[cropSlug];
    const validAmount = calculateValidAmount(cropData, level);
    const questXP = calculateQuestXP(level, cropData, validAmount);
    console.log(
      `Crop id: ${cropData.id}\tValid amount: ${validAmount}\tXP: ${questXP}\tCrop: ${cropSlug}\t`
    );
  });
};

main();
