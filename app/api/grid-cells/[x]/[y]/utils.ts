import { CROP_DATA } from "@/lib/game-constants";
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
  getUserQuests,
  updateUserQuest,
} from "@/supabase/queries";
import { DbUserHasQuest } from "@/supabase/types";
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

export const calculateUserQuestsProgress = async (
  fid: number,
  category: string,
  itemId?: number,
  itemAmount: number = 1
) => {
  // Get all quests that require harvesting this crop
  const quests = await getUserQuests(fid, {
    status: "incomplete",
    category,
  });
  if (!quests) {
    return null;
  }
  console.log(
    `[${new Date().toISOString()}] found ${
      quests.length
    } quests for user ${fid}`
  );

  const updatedQuests: DbUserHasQuest[] = [];
  // Update progress for each quest
  await Promise.all(
    quests.map(async (quest) => {
      if (
        quest.quest &&
        (quest.quest.itemId === null || quest.quest?.itemId === itemId)
      ) {
        const completed =
          quest.progress + itemAmount >= (quest.quest?.amount || 1);

        const updatedQuest = await updateUserQuest(fid, quest.questId, {
          progress: quest.progress + itemAmount,
          status: completed ? "completed" : "incomplete",
          completedAt: completed ? new Date().toISOString() : null,
        });
        updatedQuests.push(updatedQuest);
        console.log(
          `[${new Date().toISOString()}] updated quest with id ${
            quest.questId
          } for user ${fid}`
        );
        if (completed) {
          console.log(
            `[${new Date().toISOString()}] completed quest with id ${
              quest.questId
            } for user ${fid}, setting status to claimable`
          );
          // if (quest.quest?.xp || quest.quest?.coins) {
          //   const currentUser = await getUser(fid);
          //   await updateUser(fid, {
          //     xp: (currentUser?.xp || 0) + (quest.quest.xp || 0),
          //     coins: (currentUser?.coins || 0) + (quest.quest.coins || 0),
          //   });
          // }
        }
        return updatedQuest;
      } else {
        return quest;
      }
    })
  );

  return updatedQuests;
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
  await updateUserXP(fid, xp);
  return { xp, amount: cropReward };
};
