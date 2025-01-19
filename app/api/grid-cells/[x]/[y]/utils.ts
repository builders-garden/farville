import { CROP_DATA } from "@/lib/game-constants";
import { qstashPublishJSON } from "@/lib/qstash";
import {
  getUserItemByItemId,
  getGridCell,
  plantGridCell,
  removeUserItem,
  getItemBySlug,
  fertilizeGridCell,
  harvestGridCell,
  addUserItem,
  updateUserXP,
  speedBoostGridCell,
} from "@/supabase/queries";
import { CropType, SeedType } from "@/types/game";

export const plantSeed = async (
  fid: number,
  x: number,
  y: number,
  seedType: SeedType
) => {
  const item = await getItemBySlug(seedType);
  if (!item) {
    throw new Error("Item not found");
  }
  const seed = await getUserItemByItemId(fid, item.id);
  if (!seed) {
    throw new Error("Player does not have enough seeds to plant");
  }
  const gridCell = await getGridCell(fid, x, y);
  if (gridCell?.plantedAt) {
    throw new Error("Grid cell is already planted");
  }

  await plantGridCell(fid, x, y, item.slug.replace("-seeds", ""));

  await removeUserItem(fid, item.id, 1);
  return item;
};

export const harvest = async (fid: number, x: number, y: number) => {
  const gridCell = await getGridCell(fid, x, y);
  if (!gridCell) {
    throw new Error("Grid cell not found");
  }
  if (!gridCell.plantedAt) {
    throw new Error("Grid cell is not planted");
  }

  if (
    !gridCell.isReadyToHarvest &&
    // Check if enough time has passed since planting for crop to be ready:
    // plantedTime + growthTime < currentTime
    new Date(gridCell.plantedAt).getTime() + // Get plant time in milliseconds
      CROP_DATA[gridCell.cropType as CropType].growthTime > // Add required growth time for this crop
      Date.now() // Compare against current time
  ) {
    throw new Error("Grid cell is not ready to harvest");
  }
  const crop = await getItemBySlug(gridCell.cropType!);
  if (!crop) {
    throw new Error("Crop not found");
  }
  await harvestGridCell(fid, x, y);
  const rewards = await rewardUser(fid, gridCell.cropType!, crop.id);
  return {
    crop,
    rewards,
  };
};

export const fertilize = async (fid: number, x: number, y: number) => {
  const fertilizer = await getItemBySlug("fertilizer");
  if (!fertilizer) {
    throw new Error("Fertilizer not found");
  }
  const fertilizerItem = await getUserItemByItemId(fid, fertilizer.id);
  if (!fertilizerItem) {
    throw new Error("Player does not have enough fertilizer to fertilize");
  }
  const gridCell = await getGridCell(fid, x, y);
  if (!gridCell) {
    throw new Error("Grid cell not found");
  }
  if (!gridCell.plantedAt) {
    throw new Error("Grid cell is not planted");
  }
  if (gridCell.isReadyToHarvest) {
    throw new Error("Grid cell is ready to harvest");
  }
  await fertilizeGridCell(fid, x, y);
  await removeUserItem(fid, fertilizer.id, 1);
  return gridCell;
};

export const rewardUser = async (
  fid: number,
  cropType: string,
  cropId: number
) => {
  const xp = CROP_DATA[cropType].rewardXP;
  const roll = Math.random();
  const cropReward = roll < 0.6 ? 1 : roll < 0.9 ? 2 : 3;
  await addUserItem(fid, cropId, cropReward);
  const { didLevelUp, newLevel } = await updateUserXP(fid, xp);
  return { xp, amount: cropReward, didLevelUp, newLevel };
};

export async function sendQuestsCalculation(
  fid: number,
  category: string,
  itemId?: number,
  itemAmount?: number
) {
  if (process.env.NEXT_PUBLIC_URL === "http://localhost:3000") {
    return;
  }

  const questBody = {
    fid,
    category,
    itemId,
    itemAmount,
  };

  const res = await qstashPublishJSON({
    url: `${process.env.NEXT_PUBLIC_URL}/api/qstash/quest`,
    body: questBody,
  });

  console.log(
    `[QSTASH-${new Date().toISOString()}] - sent quest calculation to QStash with id: ${
      res.messageId
    }`
  );
}

export const handlePerk = async (
  fid: number,
  x: number,
  y: number,
  itemSlug: string
) => {
  const perk = await getItemBySlug(itemSlug);
  if (!perk) {
    throw new Error("Perk not found");
  }
  const perkItem = await getUserItemByItemId(fid, perk.id);
  if (!perkItem) {
    throw new Error("Player does not have enough fertilizer to fertilize");
  }
  const gridCell = await getGridCell(fid, x, y);
  if (!gridCell) {
    throw new Error("Grid cell not found");
  }
  if (!gridCell.plantedAt || !gridCell.harvestAt) {
    throw new Error("Grid cell is not planted");
  }
  if (gridCell.isReadyToHarvest) {
    throw new Error("Grid cell is ready to harvest");
  }
  const cell = await applyPerkOnCell(
    fid,
    gridCell.cropType! as CropType,
    x,
    y,
    itemSlug,
    gridCell.harvestAt as string
  );
  await removeUserItem(fid, perk.id, 1);
  return cell;
};

export const applyPerkOnCell = async (
  fid: number,
  cropType: CropType,
  x: number,
  y: number,
  itemSlug: string,
  harvestAt: string
) => {
  switch (itemSlug) {
    case "fertilizer":
      return await fertilizeGridCell(fid, x, y);
    case "nitrogen": {
      if (
        [CropType.Carrot, CropType.Wheat, CropType.Radish].includes(cropType)
      ) {
        return await speedBoostGridCell(
          fid,
          x,
          y,
          "nitrogen",
          new Date(harvestAt)
        );
      } else {
        throw new Error("Invalid perk on cell");
      }
    }
    case "potassium": {
      if (
        [
          CropType.Lettuce,
          CropType.Tomato,
          CropType.Potato,
          CropType.Corn,
          CropType.Eggplant,
          CropType.Tomato,
        ].includes(cropType)
      ) {
        return await speedBoostGridCell(
          fid,
          x,
          y,
          "potassium",
          new Date(harvestAt)
        );
      } else {
        throw new Error("Invalid perk on cell");
      }
    }
    case "phosphorus": {
      if (
        [CropType.Pumpkin, CropType.Watermelon, CropType.Strawberry].includes(
          cropType
        )
      ) {
        return await speedBoostGridCell(
          fid,
          x,
          y,
          "phosphorus",
          new Date(harvestAt)
        );
      } else {
        throw new Error("Invalid perk on cell");
      }
    }
    default:
      throw new Error("Perk not found");
  }
};
