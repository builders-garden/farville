import { REWARD_XP } from "@/lib/game-constants";
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
} from "@/supabase/queries";
import { SeedType } from "@/types/game";

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

  await removeUserItem(fid, item.id);
};

export const harvest = async (fid: number, x: number, y: number) => {
  const gridCell = await getGridCell(fid, x, y);
  if (!gridCell) {
    throw new Error("Grid cell not found");
  }
  if (!gridCell.isReadyToHarvest) {
    throw new Error("Grid cell is not ready to harvest");
  }
  const crop = await getItemBySlug(gridCell.cropType!);
  if (!crop) {
    throw new Error("Crop not found");
  }
  await harvestGridCell(fid, x, y);
  const rewards = await rewardUser(fid, gridCell.cropType!, crop.id);
  return { rewards };
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
  await removeUserItem(fid, fertilizer.id);
};

export const rewardUser = async (
  fid: number,
  cropType: string,
  cropId: number
) => {
  const xp = REWARD_XP[cropType as keyof typeof REWARD_XP];
  const roll = Math.random();
  const cropReward = roll < 0.6 ? 1 : roll < 0.9 ? 2 : 3;
  await addUserItem(fid, cropId, cropReward);
  await updateUserXP(fid, xp);
  return { xp, amount: cropReward };
};
