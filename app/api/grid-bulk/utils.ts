import { CROP_DATA, SPEED_BOOST } from "@/lib/game-constants";
import {
  getCropNameFromSeeds,
  sendDelayedNotificationToService,
} from "@/lib/game-notifications";
import { sendBatchToPostHog } from "@/lib/posthog/server";
import {
  addUserItem,
  getCurrentCommunityBooster,
  getUserGridCells,
  getUserHarvestedCrops,
  getUserItemBySlug,
  removeUserItem,
  updateGridCellsBulk,
  updateUserWeeklyScore,
  updateUserXP,
  upsertUserHarvestedCrop,
} from "@/lib/prisma/queries";
import {
  calculateGoldCropsInBatch,
  getAchievementProgressByCrop,
  getBoostTime,
  getGrowthTimeBasedOnMode,
  isBoostable,
} from "@/lib/utils";
import {
  ActionType,
  CropType,
  Mode,
  PerkType,
  SeedType,
} from "@/lib/types/game";
import { NextResponse } from "next/server";
import { UserGridCell, UserHarvestedCrop } from "@prisma/client";
import { MODE_DEFINITIONS, ModeFeature } from "@/lib/modes/constants";
import Logger from "@/lib/logger";
import { env } from "@/lib/env";
import axios from "axios";

export interface GridBulkResult {
  type: ActionType;
  cells: {
    ok: UserGridCell[];
    nok: (UserGridCell | undefined)[];
  };
  // harvest only
  rewards?: {
    cropsWithRewards: {
      crop: string;
      x: number;
      y: number;
      amount: number;
    }[];
    didLevelUp: boolean;
    newXP: number;
    goldCrops?: {
      crop: string;
      amount: number;
    }[];
    newBadges?: {
      crop: string;
      step: number;
    }[];
  };
}

export const plantBulk = async (
  fid: number,
  cells: { x: number; y: number }[],
  seedType: SeedType,
  mode: Mode
) => {
  const userSeeds = await getUserItemBySlug(fid, seedType, mode);
  Logger.logTest(
    `/api/grid-bulk user ${fid} action plant step '1. get user seeds' date ${new Date()}`
  );

  if (!userSeeds || userSeeds.quantity < cells.length) {
    return NextResponse.json(
      { error: "User does not have enough seeds" },
      {
        status: 400,
      }
    );
  }
  const gridCells = await getUserGridCells(fid, mode);
  Logger.logTest(
    `/api/grid-bulk user ${fid} action plant step: '2. get grid cells' date ${new Date()}`
  );

  const notPlantedCells: (UserGridCell | undefined)[] = [];
  const plantableCells: UserGridCell[] = [];
  // check if the cells are already planted
  for (const cell of cells) {
    const gridCell = gridCells.find((gc) => gc.x === cell.x && gc.y === cell.y);
    if (!gridCell || gridCell.plantedAt) {
      notPlantedCells.push(gridCell);
    } else {
      plantableCells.push(gridCell);
    }
  }
  Logger.logTest(
    `/api/grid-bulk user ${fid} action plant step: '3. filter cells' date ${new Date()}`
  );
  const cropType = seedType.replace("-seeds", "") as CropType;

  // get current community boost
  const currentCommunityBoost = await getCurrentCommunityBooster(mode);
  const currentCommunityBoostMultiplier = currentCommunityBoost?.stage ?? 1;
  const seedGrowthTime = Math.floor(
    getGrowthTimeBasedOnMode(cropType, mode) / currentCommunityBoostMultiplier
  );

  const updatedCellsCounter: number = (await updateGridCellsBulk(
    fid,
    plantableCells.map((cell) => ({
      ...cell,
      mode,
      cropType,
      plantedAt: new Date(),
      harvestAt: new Date(Date.now() + seedGrowthTime),
    }))
  )) as number;
  Logger.logTest(
    `/api/grid-bulk user ${fid} action plant step: '4. update grid cells in db' date ${new Date()}`
  );

  // TODO: add different track
  if (updatedCellsCounter > 0) {
    await removeUserItem(fid, userSeeds.itemId, updatedCellsCounter, mode);
    Logger.logTest(
      `/api/grid-bulk user ${fid} action plant step: '5. remove user seeds' date ${new Date()}`
    );

    Promise.allSettled([
      sendDelayedNotificationToService(
        fid,
        `Harvest time! 🌾`,
        `Your ${getCropNameFromSeeds(seedType)} are ready to harvest!`,
        "harvest",
        mode,
        seedGrowthTime
      ),
      axios({
        url: `${env.FARVILLE_SERVICE_URL}/api/async-jobs/quests-calculation`,
        method: "POST",
        headers: {
          "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
        },
        data: {
          fid,
          mode,
          category: "plant",
          itemId: userSeeds.itemId,
          itemAmount: updatedCellsCounter,
        },
      }),
      sendBatchToPostHog(
        fid,
        "planted-seed",
        plantableCells.map((cell) => ({
          seedId: userSeeds.itemId,
          cropType: cropType,
          cellId: `${cell.x}/${cell.y}`,
        }))
      ),
    ]);
    Logger.logTest(
      `/api/grid-bulk user ${fid} action plant step: '6. all promises settled' date ${new Date()}`
    );
  }
  return {
    type: ActionType.Plant,
    cells: {
      ok: updatedCellsCounter,
      nok: notPlantedCells,
    },
  };
};

export const harvestBulk = async (
  fid: number,
  cells: { x: number; y: number }[],
  mode: Mode
) => {
  const gridCells = await getUserGridCells(fid, mode);
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '1. get grid cells' date ${new Date()}`
  );
  // Use a Map for O(1) lookup
  const gridCellMap = new Map(gridCells.map((gc) => [`${gc.x},${gc.y}`, gc]));
  const harvestableCells = [];
  const notHarvestableCells = [];

  for (const cell of cells) {
    const gridCell = gridCellMap.get(`${cell.x},${cell.y}`);
    if (
      !gridCell ||
      !gridCell.plantedAt ||
      !gridCell.harvestAt ||
      !gridCell.cropType ||
      new Date(gridCell.harvestAt).getTime() > Date.now()
    ) {
      notHarvestableCells.push(gridCell);
    } else {
      harvestableCells.push(gridCell);
    }
  }
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '2. filter cells' date ${new Date()}`
  );

  const crops = harvestableCells.map((gc) => {
    return {
      crop: gc.cropType!,
      x: gc.x,
      y: gc.y,
      xp: CROP_DATA[gc.cropType!].rewardXP,
    };
  });

  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '3. map cells' date ${new Date()}`
  );
  await updateGridCellsBulk(
    fid,
    harvestableCells.map((cell) => ({
      ...cell,
      mode,
      cropType: null,
      plantedAt: null,
      isReadyToHarvest: false,
      harvestAt: null,
      speedBoostedAt: null,
    }))
  );
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '4. update grid cells in db' date ${new Date()}`
  );
  const rewards = await rewardUserBulk(fid, crops, mode);
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '5. reward user bulk' date ${new Date()}`
  );

  // update user items based on the rewards for each type of crop
  const harvestCropSummary: {
    [x: string]: number;
  } = {};
  const goldCrops: {
    crop: string;
    amount: number;
  }[] = [];
  const newBadges: {
    crop: string;
    step: number;
  }[] = [];

  rewards.cropsWithRewards.forEach((crop) => {
    if (harvestCropSummary[crop.crop]) {
      harvestCropSummary[crop.crop] += crop.amount;
    } else {
      harvestCropSummary[crop.crop] = crop.amount;
    }
  });
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '6. calc summary' date ${new Date()}`
  );

  // check if Harverst Honours is enabled inside this mode
  const isHarvestHonoursAndGoldEnabled = MODE_DEFINITIONS[
    mode
  ].features.includes(ModeFeature.HarvestHonours);
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '7. calc is honours and gold enabled' date ${new Date()}`
  );

  let userHarvestedCrops: UserHarvestedCrop[] = [];
  if (isHarvestHonoursAndGoldEnabled) {
    userHarvestedCrops = await getUserHarvestedCrops(fid);
    Logger.logTest(
      `/api/grid-bulk user ${fid} action harvest step: '8. get user harvested crops' date ${new Date()}`
    );
  }

  // Process each crop type in a single pass, run DB/API ops in parallel
  const perCropPromises = Object.keys(harvestCropSummary).map(
    async (cropType) => {
      const amount = harvestCropSummary[cropType];
      let goldCropCount = 0;

      if (isHarvestHonoursAndGoldEnabled) {
        const achievementProgress = getAchievementProgressByCrop(
          userHarvestedCrops,
          cropType as CropType
        );
        Logger.logTest(
          `/api/grid-bulk user ${fid} action harvest step: '9. get achievement progress' date ${new Date()}`
        );

        // Check if the user has reached a new badge
        if (
          achievementProgress.step < 4 &&
          achievementProgress.count + amount >= achievementProgress.currentGoal
        ) {
          newBadges.push({
            crop: cropType,
            step: achievementProgress.step,
          });
        }

        // Check if the user has found gold crops
        goldCropCount = calculateGoldCropsInBatch(
          amount,
          achievementProgress.step
        );

        const promises: Promise<unknown>[] = [];
        if (goldCropCount > 0) {
          Logger.logTest(
            `User ${fid} harvested ${goldCropCount} gold ${cropType}! 🌟`
          );
          promises.push(
            addUserItem(fid, CROP_DATA[cropType].goldId, goldCropCount, mode)
          );
          goldCrops.push({
            crop: "gold-" + cropType,
            amount: goldCropCount,
          });
        }
        promises.push(upsertUserHarvestedCrop(fid, cropType, amount));
        promises.push(
          axios({
            url: `${env.FARVILLE_SERVICE_URL}/api/async-jobs/quests-calculation`,
            method: "POST",
            headers: {
              "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
            },
            data: {
              fid,
              mode,
              category: ActionType.Harvest,
              itemId: CROP_DATA[cropType].id,
              itemAmount: amount,
            },
          })
        );
        if (amount - goldCropCount > 0) {
          promises.push(
            addUserItem(
              fid,
              CROP_DATA[cropType].id,
              amount - goldCropCount,
              mode
            )
          );
        }
        await Promise.all(promises);
      } else {
        // If not enabled, just run addUserItem and axios in parallel
        await Promise.all([
          addUserItem(fid, CROP_DATA[cropType].id, amount, mode),
          axios({
            url: `${env.FARVILLE_SERVICE_URL}/api/async-jobs/quests-calculation`,
            method: "POST",
            headers: {
              "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
            },
            data: {
              fid,
              mode,
              category: ActionType.Harvest,
              itemId: CROP_DATA[cropType].id,
              itemAmount: amount,
            },
          }),
        ]);
      }
    }
  );
  await Promise.all(perCropPromises);

  if (rewards.cropsWithRewards.length > 0) {
    await sendBatchToPostHog(
      fid,
      "harvested-crop",
      rewards.cropsWithRewards.map((crop) => ({
        cropId: CROP_DATA[crop.crop].id,
        cropType: crop.crop,
        cellId: `${crop.x}/${crop.y}`,
      }))
    );
    Logger.logTest(
      `/api/grid-bulk user ${fid} action harvest step: '12. send batch to posthog' date ${new Date()}`
    );
  }

  return {
    type: ActionType.Harvest,
    cells: {
      ok: harvestableCells,
      nok: notHarvestableCells,
    },
    rewards: {
      ...rewards,
      goldCrops,
      newBadges,
    },
  };
};

const rewardUserBulk = async (
  fid: number,
  crops: { crop: string; x: number; y: number; xp: number }[],
  mode: Mode
) => {
  const cropsWithRewards = crops.map((crop) => {
    const roll = Math.random();
    const cropReward = roll < 0.6 ? 1 : roll < 0.9 ? 2 : 3;
    return {
      ...crop,
      amount: cropReward,
    };
  });
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '4.a map crop with rewards' date ${new Date()}`
  );
  const totalXp = cropsWithRewards.reduce((acc, crop) => acc + crop.xp, 0);
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '4.b calc total xp' date ${new Date()}`
  );
  const updateResult = await updateUserXP(fid, totalXp, mode);
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '4.c update user xp' date ${new Date()}`
  );
  await updateUserWeeklyScore(
    fid,
    totalXp,
    updateResult.newLevel,
    updateResult.oldXp,
    updateResult.didLevelUp,
    mode
  );
  Logger.logTest(
    `/api/grid-bulk user ${fid} action harvest step: '4.d update user weekly score' date ${new Date()}`
  );

  return {
    cropsWithRewards,
    didLevelUp: updateResult.didLevelUp,
    newXp: updateResult.newXP,
  };
};

export const perkBulk = async (
  fid: number,
  cells: { x: number; y: number }[],
  itemSlug: PerkType,
  mode: Mode
) => {
  const userPerks = await getUserItemBySlug(fid, itemSlug, mode);

  if (!userPerks || userPerks.quantity < cells.length) {
    return NextResponse.json({ error: "User does not have enough perks" });
  }

  const gridCells = await getUserGridCells(fid, mode);

  const nonPerkableCells = [];
  const perkableCells = [];

  for (const cell of cells) {
    const gridCell = gridCells.find((gc) => gc.x === cell.x && gc.y === cell.y);
    if (!gridCell) {
      nonPerkableCells.push(gridCell);
    } else if (!gridCell.plantedAt || !gridCell.harvestAt) {
      nonPerkableCells.push(gridCell);
    } else if (gridCell.isReadyToHarvest) {
      nonPerkableCells.push(gridCell);
    } else {
      // Check if enough time has passed since last speed boost
      if (gridCell.speedBoostedAt) {
        const lastBoostTime = new Date(gridCell.speedBoostedAt);
        if (isBoostable(itemSlug, mode, lastBoostTime)) {
          nonPerkableCells.push(gridCell);
          continue;
        }
      }
      const boostTime = getBoostTime(itemSlug, mode);
      await sendDelayedNotificationToService(
        fid,
        `Harvest time! 🌾`,
        `Your ${gridCell.cropType} are ready to harvest!`,
        "harvest",
        mode,
        Math.floor(
          new Date(gridCell.harvestAt).getTime() - boostTime - Date.now()
        )
      );
      perkableCells.push({
        ...gridCell,
        harvestAt: new Date(new Date(gridCell.harvestAt).getTime() - boostTime),
        speedBoostedAt: new Date(),
      });
    }
  }

  const updatedCellsCounter = (await updateGridCellsBulk(
    fid,
    perkableCells
  )) as number;

  // track with posthog
  if (updatedCellsCounter > 0) {
    await removeUserItem(fid, userPerks.itemId, updatedCellsCounter, mode);

    Promise.allSettled([
      sendDelayedNotificationToService(
        fid,
        `Speed boost expired! ⚡️`,
        `The speed boost has worn off. Check your crops!`,
        "boost-expired",
        mode,
        SPEED_BOOST[itemSlug].duration
      ),
      sendBatchToPostHog(
        fid,
        "applied-perk",
        perkableCells.map((cell) => ({
          cellId: `${cell.x}/${cell.y}`,
          cropType: cell.cropType,
          itemSlug,
        }))
      ),
    ]);
  }

  return {
    type: ActionType.ApplyPerk,
    cells: {
      ok: updatedCellsCounter,
      nok: nonPerkableCells,
    },
  };
};

export const fertilizeBulk = async (
  fid: number,
  cells: { x: number; y: number }[],
  mode: Mode
) => {
  const userPerks = await getUserItemBySlug(fid, PerkType.Fertilizer, mode);

  if (!userPerks || userPerks.quantity < cells.length) {
    return NextResponse.json({ error: "User does not have enough perks" });
  }

  const gridCells = await getUserGridCells(fid, mode);

  const nonPerkableCells = [];
  const perkableCells = [];

  for (const cell of cells) {
    const gridCell = gridCells.find((gc) => gc.x === cell.x && gc.y === cell.y);
    if (!gridCell) {
      nonPerkableCells.push(gridCell);
    } else if (!gridCell.plantedAt || !gridCell.harvestAt) {
      nonPerkableCells.push(gridCell);
    } else if (gridCell.isReadyToHarvest) {
      nonPerkableCells.push(gridCell);
    } else {
      perkableCells.push({
        ...gridCell,
        harvestAt: new Date(),
        speedBoostedAt: new Date(),
      });
    }
  }

  const updatedCellsCounter = (await updateGridCellsBulk(
    fid,
    perkableCells
  )) as number;

  if (updatedCellsCounter > 0) {
    await removeUserItem(fid, userPerks.itemId, updatedCellsCounter, mode);

    await sendBatchToPostHog(
      fid,
      "applied-perk",
      perkableCells.map((cell) => ({
        cellId: `${cell.x}/${cell.y}`,
        cropType: cell.cropType,
        itemSlug: PerkType.Fertilizer,
      }))
    );
  }

  return {
    type: ActionType.Fertilize,
    cells: {
      ok: updatedCellsCounter,
      nok: nonPerkableCells,
    },
  };
};
