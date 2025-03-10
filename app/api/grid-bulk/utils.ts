import { CROP_DATA, SPEED_BOOST } from "@/lib/game-constants";
import {
  getCropNameFromSeeds,
  getGrowthTime,
  sendDelayedNotification,
} from "@/lib/game-notifications";
import { sendBatchToPostHog } from "@/lib/posthog/server";
import {
  getUserItemBySlug,
  removeUserItem,
  updateGridCellsBulk,
  updateUserXP,
} from "@/lib/prisma/queries";
import {
  calculateGoldCropsInBatch,
  getAchievementProgressByCrop,
  getBoostTime,
} from "@/lib/utils";
import {
  addUserItem,
  getGridCells,
  getUserHarvestedCrops,
  upsertUserHarvestedCrop,
} from "@/supabase/queries";
import { DbGridCell } from "@/supabase/types";
import { ActionType, CropType, PerkType, SeedType } from "@/types/game";
import { NextResponse } from "next/server";
import { sendQuestsCalculation } from "../grid-cells/utils";

export interface GridBulkResult {
  type: ActionType;
  cells: {
    ok: DbGridCell[];
    nok: (DbGridCell | undefined)[];
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
  seedType: SeedType
) => {
  const userSeeds = await getUserItemBySlug(fid, seedType);

  if (!userSeeds || userSeeds.quantity < cells.length) {
    return NextResponse.json({ error: "User does not have enough seeds" });
  }
  const gridCells = await getGridCells(fid);

  const notPlantedCells: (DbGridCell | undefined)[] = [];
  const plantableCells: DbGridCell[] = [];
  // check if the cells are already planted
  for (const cell of cells) {
    const gridCell = gridCells.find((gc) => gc.x === cell.x && gc.y === cell.y);
    if (!gridCell || gridCell.plantedAt) {
      notPlantedCells.push(gridCell);
    } else {
      plantableCells.push(gridCell);
    }
  }
  const cropType = seedType.replace("-seeds", "");
  const updatedGridCellsBulk = await updateGridCellsBulk(
    fid,
    plantableCells.map((cell) => ({
      ...cell,
      cropType,
      plantedAt: new Date().toISOString(),
      harvestAt: new Date(
        Date.now() + CROP_DATA[cropType].growthTime
      ).toISOString(),
    }))
  );

  // TODO: add different track
  if (updatedGridCellsBulk.length > 0) {
    await removeUserItem(fid, userSeeds.itemId, updatedGridCellsBulk.length);

    await sendDelayedNotification(
      fid.toString(),
      `Harvest time! 🌾`,
      `Your ${getCropNameFromSeeds(seedType)} are ready to harvest!`,
      "harvest",
      getGrowthTime(seedType)
    );
    await sendQuestsCalculation(
      fid,
      "plant",
      userSeeds.itemId,
      updatedGridCellsBulk.length
    );
    await sendBatchToPostHog(
      fid,
      "planted-seed",
      updatedGridCellsBulk.map((cell) => ({
        seedId: userSeeds.itemId,
        cropType: cropType,
        cellId: `${cell.x}/${cell.y}`,
      }))
    );
  }

  return {
    type: ActionType.Plant,
    cells: {
      ok: updatedGridCellsBulk,
      nok: notPlantedCells,
    },
  };
};

export const harvestBulk = async (
  fid: number,
  cells: { x: number; y: number }[]
) => {
  const gridCells = await getGridCells(fid);
  const harvestableCells = [];
  const notHarvestableCells = [];

  for (const cell of cells) {
    const gridCell = gridCells.find((gc) => gc.x === cell.x && gc.y === cell.y);
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

  const crops = harvestableCells.map((gc) => {
    return {
      crop: gc.cropType!,
      x: gc.x,
      y: gc.y,
      xp: CROP_DATA[gc.cropType!].rewardXP,
    };
  });
  await updateGridCellsBulk(
    fid,
    harvestableCells.map((cell) => ({
      ...cell,
      cropType: null,
      plantedAt: null,
      isReadyToHarvest: false,
      harvestAt: null,
      speedBoostedAt: null,
    }))
  );
  const rewards = await rewardUserBulk(fid, crops);

  // update user items based on the rewards for each type of crop
  const harvestCropSummary: {
    [x: string]: number;
  } = {};

  rewards.cropsWithRewards.forEach((crop) => {
    if (harvestCropSummary[crop.crop]) {
      harvestCropSummary[crop.crop] += crop.amount;
    } else {
      harvestCropSummary[crop.crop] = crop.amount;
    }
  });

  const goldCrops: {
    crop: string;
    amount: number;
  }[] = [];
  const newBadges: {
    crop: string;
    step: number;
  }[] = [];
  const userHarvestedCrops = await getUserHarvestedCrops(fid);

  // Process each crop type in a single pass
  for (const cropType in harvestCropSummary) {
    const amount = harvestCropSummary[cropType];
    const achievementProgress = getAchievementProgressByCrop(
      userHarvestedCrops,
      cropType as CropType
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

    const goldCropCount = calculateGoldCropsInBatch(
      amount,
      achievementProgress.step
    );

    if (goldCropCount > 0) {
      console.log(
        `User ${fid} harvested ${goldCropCount} gold ${cropType}! 🌟`
      );
      await addUserItem(fid, CROP_DATA[cropType].goldId, goldCropCount);
      goldCrops.push({
        crop: "gold-" + cropType,
        amount: goldCropCount,
      });
    }

    const regularCropAmount = amount - goldCropCount;
    if (regularCropAmount > 0) {
      await addUserItem(fid, CROP_DATA[cropType].id, regularCropAmount);
    }

    await upsertUserHarvestedCrop(fid, cropType, amount);
    await sendQuestsCalculation(
      fid,
      ActionType.Harvest,
      CROP_DATA[cropType].id,
      amount
    );
  }

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
  crops: { crop: string; x: number; y: number; xp: number }[]
) => {
  const cropsWithRewards = crops.map((crop) => {
    const roll = Math.random();
    const cropReward = roll < 0.6 ? 1 : roll < 0.9 ? 2 : 3;
    return {
      ...crop,
      amount: cropReward,
    };
  });
  const totalXp = cropsWithRewards.reduce((acc, crop) => acc + crop.xp, 0);
  const { didLevelUp, newXP } = await updateUserXP(fid, totalXp);

  return {
    cropsWithRewards,
    didLevelUp,
    newXP,
  };
};

export const perkBulk = async (
  fid: number,
  cells: { x: number; y: number }[],
  itemSlug: PerkType
) => {
  const userPerks = await getUserItemBySlug(fid, itemSlug);

  if (!userPerks || userPerks.quantity < cells.length) {
    return NextResponse.json({ error: "User does not have enough perks" });
  }

  const gridCells = await getGridCells(fid);

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
        const timeSinceBoost = Date.now() - lastBoostTime.getTime();
        if (timeSinceBoost < SPEED_BOOST[itemSlug].duration) {
          nonPerkableCells.push(gridCell);
          continue;
        }
      }
      const boostTime = getBoostTime(itemSlug);
      await sendDelayedNotification(
        fid.toString(),
        `Harvest time! 🌾`,
        `Your ${gridCell.cropType} are ready to harvest!`,
        "harvest",
        (new Date(gridCell.harvestAt as string).getTime() -
          boostTime -
          Date.now()) /
          1000
      );
      perkableCells.push({
        ...gridCell,
        harvestAt: new Date(
          new Date(gridCell.harvestAt).getTime() - boostTime
        ).toISOString(),
        speedBoostedAt: new Date().toISOString(),
      });
    }
  }

  const updatedGridCells = await updateGridCellsBulk(fid, perkableCells);

  // track with posthog
  if (updatedGridCells.length > 0) {
    await removeUserItem(fid, userPerks.itemId, updatedGridCells.length);

    // TODO: handle this if we want to add Perk Quests
    // await sendQuestsCalculation(
    //   fid,
    //   "apply-perk",
    //   userPerks.itemId,
    //   updatedGridCells.length
    // );

    await sendDelayedNotification(
      fid.toString(),
      `Speed boost expired! ⚡️`,
      `The speed boost has worn off. Check your crops!`,
      "boost-expired",
      SPEED_BOOST[itemSlug].duration
    );

    await sendBatchToPostHog(
      fid,
      "applied-perk",
      updatedGridCells.map((cell) => ({
        cellId: `${cell.x}/${cell.y}`,
        cropType: cell.cropType,
        itemSlug,
      }))
    );
  }

  return {
    type: ActionType.ApplyPerk,
    cells: {
      ok: updatedGridCells,
      nok: nonPerkableCells,
    },
  };
};

export const fertilizeBulk = async (
  fid: number,
  cells: { x: number; y: number }[]
) => {
  const userPerks = await getUserItemBySlug(fid, PerkType.Fertilizer);

  if (!userPerks || userPerks.quantity < cells.length) {
    return NextResponse.json({ error: "User does not have enough perks" });
  }

  const gridCells = await getGridCells(fid);

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
        harvestAt: new Date().toISOString(),
        speedBoostedAt: new Date().toISOString(),
      });
    }
  }

  const updatedGridCells = await updateGridCellsBulk(fid, perkableCells);

  if (updatedGridCells.length > 0) {
    await removeUserItem(fid, userPerks.itemId, updatedGridCells.length);

    await sendBatchToPostHog(
      fid,
      "applied-perk",
      updatedGridCells.map((cell) => ({
        cellId: `${cell.x}/${cell.y}`,
        cropType: cell.cropType,
        itemSlug: PerkType.Fertilizer,
      }))
    );
  }

  return {
    type: ActionType.Fertilize,
    cells: {
      ok: updatedGridCells,
      nok: nonPerkableCells,
    },
  };
};
