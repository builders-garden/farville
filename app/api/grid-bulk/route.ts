import { CROP_DATA } from "@/lib/game-constants";
import {
  getCropNameFromSeeds,
  getGrowthTime,
  sendDelayedNotification,
} from "@/lib/game-notifications";
import {
  getUserItemBySeedType,
  removeUserItem,
  updateGridCellsBulk,
  updateUserXP,
} from "@/lib/prisma/queries";
import { addUserItem, getGridCells } from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";
import { sendQuestsCalculation } from "../grid-cells/[x]/[y]/utils";
import { SeedType } from "@/types/game";
import { sendBatchToPostHog, trackEvent } from "@/lib/posthog/server";

interface PlantBulkRequest {
  fid: string;
  action: string;
  seedType: SeedType;
  cells: {
    x: number;
    y: number;
  }[];
}

export const POST = async (req: NextRequest) => {
  // const fid = req.headers.get("x-user-fid");
  // if (!fid) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const { fid, action, seedType, cells }: PlantBulkRequest = await req.json();

  switch (action) {
    case "plant":
      const plantResult = await plantBulk(Number(fid), cells, seedType);
      return NextResponse.json({
        success: true,
        data: plantResult,
      });
    case "harvest":
      const harvestResult = await harvestBulk(Number(fid), cells);
      return NextResponse.json({
        success: true,
        data: harvestResult,
      });
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
};

const plantBulk = async (
  fid: number,
  cells: { x: number; y: number }[],
  seedType: SeedType
) => {
  const userSeeds = await getUserItemBySeedType(fid, seedType);

  if (!userSeeds || userSeeds.quantity < cells.length) {
    return NextResponse.json({ error: "User does not have enough seeds" });
  }
  const gridCells = await getGridCells(fid);

  const notPlantedCells = [];
  const plantableCells = [];
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

  // TODO: add different track
  if (updatedGridCellsBulk.length > 0) {
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

  await removeUserItem(fid, userSeeds.itemId, updatedGridCellsBulk.length);

  return {
    cells: {
      planted: updatedGridCellsBulk,
      notPlanted: notPlantedCells,
    },
  };
};

const harvestBulk = async (fid: number, cells: { x: number; y: number }[]) => {
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
      console.log(
        `Cell ${cell.x}/${cell.y} is not planted or not ready to harvest`
      );
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

  // for each crop type, update the user items
  for (const cropType in harvestCropSummary) {
    await addUserItem(
      fid,
      CROP_DATA[cropType].id,
      harvestCropSummary[cropType]
    );
    // TODO: send quest calculation here
  }

  return rewards;
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
  const { didLevelUp, newLevel, newXP } = await updateUserXP(fid, totalXp);
  if (didLevelUp) {
    trackEvent(fid, "leveled-up", {
      xp: newXP,
      level: newLevel,
    });
  }
  console.log("Rewarding user", {
    cropsWithRewards,
    didLevelUp,
    newXP,
  });
  return {
    cropsWithRewards,
    didLevelUp,
    newXP,
  };
};
