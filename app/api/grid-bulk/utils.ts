import { CROP_DATA, SPEED_BOOST } from "@/lib/game-constants";
import {
  getCropNameFromSeeds,
  getGrowthTime,
  sendDelayedNotification,
} from "@/lib/game-notifications";
import { sendBatchToPostHog } from "@/lib/posthog/server";
import {
  addUserItem,
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
import { sendQuestsCalculation } from "../grid-cells/utils";
import { UserGridCell, UserHarvestedCrop } from "@prisma/client";
import { MODE_DEFINITIONS, ModeFeature } from "@/lib/modes/constants";

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
  console.log(
    "/api/grid-bulk user",
    fid,
    "action plant",
    "step: '1. get user seeds'",
    "date",
    new Date()
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
  console.log(
    "/api/grid-bulk user",
    fid,
    "action plant",
    "step: '2. get grid cells'",
    "date",
    new Date()
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
  console.log(
    "/api/grid-bulk user",
    fid,
    "action plant",
    "step: '3. filter cells'",
    "date",
    new Date()
  );
  const cropType = seedType.replace("-seeds", "") as CropType;
  const updatedGridCellsBulk = await updateGridCellsBulk(
    fid,
    plantableCells.map((cell) => ({
      ...cell,
      mode,
      cropType,
      plantedAt: new Date(),
      harvestAt: new Date(
        Date.now() + getGrowthTimeBasedOnMode(cropType, mode)
      ),
    }))
  );
  console.log(
    "/api/grid-bulk user",
    fid,
    "action plant",
    "step: '4. update grid cells in db'",
    "date",
    new Date()
  );

  // TODO: add different track
  if (updatedGridCellsBulk.length > 0) {
    await removeUserItem(
      fid,
      userSeeds.itemId,
      updatedGridCellsBulk.length,
      mode
    );
    console.log(
      "/api/grid-bulk user",
      fid,
      "action plant",
      "step: '5. remove user seeds'",
      "date",
      new Date()
    );

    await sendDelayedNotification(
      fid.toString(),
      `Harvest time! 🌾`,
      `Your ${getCropNameFromSeeds(seedType)} are ready to harvest!`,
      "harvest",
      mode,
      getGrowthTime(seedType)
    );
    console.log(
      "/api/grid-bulk user",
      fid,
      "action plant",
      "step: '6. send delayed notification'",
      "date",
      new Date()
    );

    await sendQuestsCalculation(
      fid,
      "plant",
      mode,
      userSeeds.itemId,
      updatedGridCellsBulk.length
    );
    console.log(
      "/api/grid-bulk user",
      fid,
      "action plant",
      "step: '7. send quests calculation'",
      "date",
      new Date()
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
    console.log(
      "/api/grid-bulk user",
      fid,
      "action plant",
      "step: '8. send batch to posthog'",
      "date",
      new Date()
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
  cells: { x: number; y: number }[],
  mode: Mode
) => {
  const gridCells = await getUserGridCells(fid, mode);
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '1. get grid cells'",
    "date",
    new Date()
  );
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
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '2. filter cells'",
    "date",
    new Date()
  );

  const crops = harvestableCells.map((gc) => {
    return {
      crop: gc.cropType!,
      x: gc.x,
      y: gc.y,
      xp: CROP_DATA[gc.cropType!].rewardXP,
    };
  });

  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '3. map cells'",
    "date",
    new Date()
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
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '4. update grid cells in db'",
    "date",
    new Date()
  );
  const rewards = await rewardUserBulk(fid, crops, mode);
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '5. reward user bulk'",
    "date",
    new Date()
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
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '6. calc summary'",
    "date",
    new Date()
  );

  // check if Harverst Honours is enabled inside this mode
  const isHarvestHonoursAndGoldEnabled = MODE_DEFINITIONS[
    mode
  ].features.includes(ModeFeature.HarvestHonours);
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '7. calc is honours and gold enabled'",
    "date",
    new Date()
  );

  let userHarvestedCrops: UserHarvestedCrop[] = [];
  if (isHarvestHonoursAndGoldEnabled) {
    userHarvestedCrops = await getUserHarvestedCrops(fid);
    console.log(
      "/api/grid-bulk user",
      fid,
      "action harvest",
      "step: '8. get user harvested crops'",
      "date",
      new Date()
    );
  }

  // Process each crop type in a single pass
  for (const cropType in harvestCropSummary) {
    const amount = harvestCropSummary[cropType];
    let goldCropCount = 0;

    if (isHarvestHonoursAndGoldEnabled) {
      const achievementProgress = getAchievementProgressByCrop(
        userHarvestedCrops,
        cropType as CropType
      );
      console.log(
        "/api/grid-bulk user",
        fid,
        "action harvest",
        "step: '9. get achievement progress'",
        "date",
        new Date()
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

      if (goldCropCount > 0) {
        console.log(
          `User ${fid} harvested ${goldCropCount} gold ${cropType}! 🌟`
        );
        await addUserItem(fid, CROP_DATA[cropType].goldId, goldCropCount, mode);
        goldCrops.push({
          crop: "gold-" + cropType,
          amount: goldCropCount,
        });
      }

      await upsertUserHarvestedCrop(fid, cropType, amount);
    }

    const regularCropAmount = amount - goldCropCount;
    if (regularCropAmount > 0) {
      await addUserItem(fid, CROP_DATA[cropType].id, regularCropAmount, mode);
      console.log(
        "/api/grid-bulk user",
        fid,
        "action harvest",
        "step: '10. add user item'",
        "date",
        new Date()
      );
    }

    await sendQuestsCalculation(
      fid,
      ActionType.Harvest,
      mode,
      CROP_DATA[cropType].id,
      amount
    );
    console.log(
      "/api/grid-bulk user",
      fid,
      "action harvest",
      "step: '11. send quests calculation'",
      "date",
      new Date()
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
    console.log(
      "/api/grid-bulk user",
      fid,
      "action harvest",
      "step: '12. send batch to posthog'",
      "date",
      new Date()
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
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '4.a map crop with rewards'",
    "date",
    new Date()
  );
  const totalXp = cropsWithRewards.reduce((acc, crop) => acc + crop.xp, 0);
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '4.b calc total xp'",
    "date",
    new Date()
  );
  const updateResult = await updateUserXP(fid, totalXp, mode);
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '4.c update user xp'",
    "date",
    new Date()
  );
  await updateUserWeeklyScore(
    fid,
    totalXp,
    updateResult.newLevel,
    updateResult.oldXp,
    updateResult.didLevelUp,
    mode
  );
  console.log(
    "/api/grid-bulk user",
    fid,
    "action harvest",
    "step: '4.d update user weekly score'",
    "date",
    new Date()
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
      await sendDelayedNotification(
        fid.toString(),
        `Harvest time! 🌾`,
        `Your ${gridCell.cropType} are ready to harvest!`,
        "harvest",
        mode,
        (new Date(gridCell.harvestAt).getTime() - boostTime - Date.now()) / 1000
      );
      perkableCells.push({
        ...gridCell,
        harvestAt: new Date(new Date(gridCell.harvestAt).getTime() - boostTime),
        speedBoostedAt: new Date(),
      });
    }
  }

  const updatedGridCells = await updateGridCellsBulk(fid, perkableCells);

  // track with posthog
  if (updatedGridCells.length > 0) {
    await removeUserItem(fid, userPerks.itemId, updatedGridCells.length, mode);

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
      mode,
      SPEED_BOOST[itemSlug].duration / 1000
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

  const updatedGridCells = await updateGridCellsBulk(fid, perkableCells);

  if (updatedGridCells.length > 0) {
    await removeUserItem(fid, userPerks.itemId, updatedGridCells.length, mode);

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
