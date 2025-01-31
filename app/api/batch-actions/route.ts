import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  CROP_DATA,
  SPEED_BOOST,
  LEVEL_XP_THRESHOLDS,
  LEVEL_REWARDS,
} from "@/lib/game-constants";
import { CropType, SeedType } from "@/types/game";
import { GridCell, PrismaClient } from "@prisma/client";
import {
  sendDelayedNotification,
  getGrowthTime,
  getCropNameFromSeeds,
} from "@/lib/game-notifications";
import { trackEvent } from "@/lib/posthog/server";
import { sendQuestsCalculation } from "@/app/api/grid-cells/[x]/[y]/utils";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// Add type for boost types
type BoostType = "nitrogen" | "potassium" | "phosphorus";

// Add these types at the top of the file
interface BaseActionResult {
  success: boolean;
  cell?: GridCell;
}

export interface PlantActionResult extends BaseActionResult {
  type: "plant";
}

export interface HarvestActionResult extends BaseActionResult {
  type: "harvest";
  rewards?: {
    xp: number;
    amount: number;
    didLevelUp: boolean;
    newLevel: number;
    cropType: CropType;
  };
}

export interface FertilizeActionResult extends BaseActionResult {
  type: "fertilize";
}

export interface PerkActionResult extends BaseActionResult {
  type: "perk";
}

export type ActionResult =
  | PlantActionResult
  | HarvestActionResult
  | FertilizeActionResult
  | PerkActionResult;

export async function POST(req: Request) {
  const body = await req.json();
  const { actions } = body;
  const fid = Number(req.headers.get("x-user-fid"));

  // Use a transaction to ensure all actions are atomic
  const results = await prisma
    .$transaction<ActionResult[]>(async (tx) => {
      console.log("[POST] Starting transaction");
      const actionResults = [];

      for (const action of actions) {
        const { type, x, y, params } = action;

        switch (type) {
          case "plant":
            actionResults.push(await handlePlantAction(tx, fid, x, y, params));
            break;
          case "harvest":
            actionResults.push(await handleHarvestAction(tx, fid, x, y));
            break;
          case "fertilize":
            actionResults.push(await handleFertilizeAction(tx, fid, x, y));
            break;
          case "perk":
            actionResults.push(await handlePerkAction(tx, fid, x, y, params));
            break;
        }
      }

      return actionResults;
    })
    .catch((error) => {
      console.error("Transaction failed:", error);
      throw error;
    });

  return NextResponse.json(results);
}

async function handlePlantAction(
  tx: TransactionClient,
  fid: number,
  x: number,
  y: number,
  params: { seedType: SeedType }
): Promise<PlantActionResult> {
  console.log("[handlePlantAction] Starting plant action");
  // Get the item (seed)
  const item = await tx.item.findFirst({
    where: { slug: params.seedType },
  });
  if (!item) throw new Error("Item not found");

  // Check if user has the seed
  const seed = await tx.userHasItem.findFirst({
    where: { userFid: fid, itemId: item.id },
  });
  if (!seed || seed.quantity <= 0)
    throw new Error("Player does not have enough seeds to plant");

  // Check if cell is available
  const gridCell = await tx.gridCell.findFirst({
    where: { fid: fid, x, y },
  });
  if (gridCell?.plantedAt) throw new Error("Grid cell is already planted");

  // Plant the seed
  const cropType = item.slug.replace("-seeds", "");
  const plantedCell = await tx.gridCell.update({
    where: { fid_x_y: { fid: fid, x, y } },
    data: {
      plantedAt: new Date().toISOString(),
      cropType,
      harvestAt: new Date(
        Date.now() + CROP_DATA[cropType as CropType].growthTime
      ).toISOString(),
    },
  });

  // Remove seed from inventory
  await tx.userHasItem.update({
    where: {
      userFid_itemId: { userFid: fid, itemId: seed.itemId },
      quantity: { gt: 0 },
    },
    data: { quantity: { decrement: 1 } },
  });

  // After successful planting, add notifications and quest calculation
  await Promise.all([
    sendDelayedNotification(
      fid.toString(),
      `Harvest time! 🌾`,
      `Your ${getCropNameFromSeeds(params.seedType)} are ready to harvest!`,
      "harvest",
      getGrowthTime(params.seedType)
    ),
    sendQuestsCalculation(fid, "plant", item.id),
    trackEvent(fid, "planted-seed", {
      seedId: item.id,
      cropType: cropType,
      cellId: `${x}/${y}`,
    }),
  ]);

  return {
    type: "plant",
    success: true,
    cell: plantedCell,
  };
}

async function handleHarvestAction(
  tx: TransactionClient,
  fid: number,
  x: number,
  y: number
): Promise<HarvestActionResult> {
  // Get the grid cell
  const gridCell = await tx.gridCell.findUnique({
    where: { fid_x_y: { fid, x, y } },
  });
  if (!gridCell) throw new Error("Grid cell not found");
  if (!gridCell.plantedAt || !gridCell.harvestAt)
    throw new Error("Grid cell is not planted");

  // Check harvest timing
  if (
    !gridCell.isReadyToHarvest &&
    gridCell.harvestAt &&
    Date.now() < new Date(gridCell.harvestAt).getTime()
  ) {
    throw new Error("Grid cell is not ready to harvest");
  }

  // Get crop item
  const crop = await tx.item.findUnique({
    where: { slug: gridCell.cropType! },
  });
  if (!crop) throw new Error("Crop not found");

  // Clear the cell
  await tx.gridCell.update({
    where: { fid_x_y: { fid: fid, x, y } },
    data: {
      plantedAt: { set: null },
      harvestAt: { set: null },
      cropType: { set: null },
      isReadyToHarvest: false,
      yieldBoost: 0,
      speedBoostedAt: { set: null },
    },
  });

  // Calculate and give rewards
  const xp = CROP_DATA[gridCell.cropType as CropType].rewardXP;
  const roll = Math.random();
  const cropReward = roll < 0.6 ? 1 : roll < 0.9 ? 2 : 3;

  // Add crops to inventory
  await tx.userHasItem.upsert({
    where: {
      userFid_itemId: {
        userFid: gridCell.fid,
        itemId: crop.id,
      },
    },
    create: {
      userFid: gridCell.fid,
      itemId: crop.id,
      quantity: cropReward,
    },
    update: {
      quantity: { increment: cropReward },
    },
  });

  // Get current user XP before update
  const currentUser = await tx.user.findUnique({
    where: { fid: gridCell.fid },
    select: { xp: true, coins: true },
  });
  if (!currentUser) throw new Error("User not found");

  // Update user XP
  const user = await tx.user.update({
    where: { fid: gridCell.fid },
    data: { xp: { increment: xp } },
  });

  // Calculate level up using LEVEL_XP_THRESHOLDS
  const currentLevel = LEVEL_XP_THRESHOLDS.findIndex(
    (threshold) => currentUser.xp < threshold
  );
  const newLevel = LEVEL_XP_THRESHOLDS.findIndex(
    (threshold) => user.xp < threshold
  );
  const didLevelUp = newLevel > currentLevel;

  // Give level up rewards if applicable
  if (didLevelUp) {
    const levelReward = LEVEL_REWARDS[newLevel - 1];
    await tx.user.update({
      where: { fid: gridCell.fid },
      data: { coins: { increment: levelReward.coins } },
    });
  }

  const updatedCell = await tx.gridCell.update({
    where: { fid_x_y: { fid: fid, x, y } },
    data: {
      plantedAt: { set: null },
      harvestAt: { set: null },
      cropType: { set: null },
      isReadyToHarvest: false,
      yieldBoost: 0,
      speedBoostedAt: { set: null },
    },
  });

  // Add quest calculation and tracking
  await Promise.all([
    sendQuestsCalculation(fid, "harvest", crop.id, cropReward),
    trackEvent(fid, "harvested-crop", {
      cropId: crop.id,
      cropType: gridCell.cropType,
      cellId: `${x}/${y}`,
    }),
  ]);

  return {
    type: "harvest",
    success: true,
    cell: updatedCell,
    rewards: {
      xp,
      amount: cropReward,
      didLevelUp,
      newLevel,
      cropType: gridCell.cropType as CropType,
    },
  };
}

async function handleFertilizeAction(
  tx: TransactionClient,
  fid: number,
  x: number,
  y: number
): Promise<FertilizeActionResult> {
  // Get fertilizer item
  const fertilizer = await tx.item.findFirst({
    where: { slug: "fertilizer" },
  });
  if (!fertilizer) throw new Error("Fertilizer not found");

  // Check if user has fertilizer
  const fertilizerItem = await tx.userHasItem.findFirst({
    where: { userFid: fid, itemId: fertilizer.id },
  });
  if (!fertilizerItem)
    throw new Error("Player does not have enough fertilizer");

  // Get and validate grid cell
  const gridCell = await tx.gridCell.findFirst({
    where: { fid, x, y },
  });
  if (!gridCell) throw new Error("Grid cell not found");
  if (!gridCell.plantedAt) throw new Error("Grid cell is not planted");
  if (gridCell.isReadyToHarvest)
    throw new Error("Grid cell is ready to harvest");

  // Apply fertilizer
  const updatedCell = await tx.gridCell.update({
    where: { fid_x_y: { fid, x, y } },
    data: { yieldBoost: { increment: 1 } },
  });

  // Remove fertilizer from inventory
  await tx.userHasItem.update({
    where: {
      userFid_itemId: { userFid: fid, itemId: fertilizerItem.itemId },
      quantity: { gt: 0 },
    },
    data: { quantity: { decrement: 1 } },
  });

  // Add quest calculation and tracking
  await Promise.all([
    sendQuestsCalculation(fid, "fertilize", fertilizer.id),
    trackEvent(fid, "fertilized-cell", {
      cellId: `${x}/${y}`,
      cropType: gridCell.cropType,
    }),
  ]);

  return {
    type: "fertilize",
    success: true,
    cell: updatedCell,
  };
}

async function handlePerkAction(
  tx: TransactionClient,
  fid: number,
  x: number,
  y: number,
  params: { itemSlug: string }
): Promise<PerkActionResult> {
  const { itemSlug } = params;

  console.log(
    `[handlePerkAction] Starting perk action for user ${fid} at (${x},${y}) with item ${itemSlug}`
  );

  // Get perk item
  const perk = await tx.item.findFirst({
    where: { slug: itemSlug },
  });
  if (!perk) {
    console.error(`[handlePerkAction] Perk not found: ${itemSlug}`);
    throw new Error("Perk not found");
  }

  // Check if user has perk
  const perkItem = await tx.userHasItem.findFirst({
    where: { userFid: fid, itemId: perk.id },
  });
  if (!perkItem || perkItem.quantity <= 0) {
    console.error(
      `[handlePerkAction] User ${fid} does not have perk ${itemSlug}`
    );
    throw new Error("Player does not have the perk");
  }

  // Get and validate grid cell
  const gridCell = await tx.gridCell.findFirst({
    where: { fid, x, y },
  });
  if (!gridCell) {
    console.error(`[handlePerkAction] Grid cell not found at (${x},${y})`);
    throw new Error("Grid cell not found");
  }
  if (!gridCell.plantedAt || !gridCell.harvestAt) {
    console.error(`[handlePerkAction] Grid cell (${x},${y}) is not planted`);
    throw new Error("Grid cell is not planted");
  }
  if (gridCell.isReadyToHarvest) {
    console.error(
      `[handlePerkAction] Grid cell (${x},${y}) is ready to harvest`
    );
    throw new Error("Grid cell is ready to harvest");
  }

  console.log(
    `[handlePerkAction] Applying perk ${itemSlug} to cell (${x},${y})`
  );
  // Apply perk based on type
  const updatedCell = await applyPerkToCell(tx, gridCell, itemSlug);

  // Remove perk from inventory
  await tx.userHasItem.update({
    where: {
      userFid_itemId: { userFid: fid, itemId: perkItem.itemId },
      quantity: { gt: 0 },
    },
    data: { quantity: { decrement: 1 } },
  });
  console.log(
    `[handlePerkAction] Successfully applied perk ${itemSlug} to cell (${x},${y})`
  );

  // Add notifications, quest calculation and tracking
  await Promise.all([
    sendQuestsCalculation(fid, "apply-perk", perk.id),
    sendDelayedNotification(
      fid.toString(),
      `Harvest time! 🌾`,
      `Your ${updatedCell.cropType} are ready to harvest!`,
      "harvest",
      new Date(updatedCell.harvestAt as Date).getTime() - Date.now()
    ),
    sendDelayedNotification(
      fid.toString(),
      `Speed boost expired! ⚡️`,
      `The speed boost on your ${updatedCell.cropType} has worn off.`,
      "boost-expired",
      SPEED_BOOST[itemSlug as BoostType].duration / 1000
    ),
    trackEvent(fid, "applied-perk", {
      cellId: `${x}/${y}`,
      cropType: updatedCell.cropType,
      itemSlug,
    }),
  ]);

  return {
    type: "perk",
    success: true,
    cell: updatedCell,
  };
}

async function applyPerkToCell(
  tx: TransactionClient,
  gridCell: GridCell,
  itemSlug: string
) {
  const cropType = gridCell.cropType as CropType;
  const harvestAt = gridCell.harvestAt ? new Date(gridCell.harvestAt) : null;

  console.log(
    `[applyPerkToCell] Applying perk ${itemSlug} to cell (${gridCell.x},${gridCell.y})`
  );

  switch (itemSlug) {
    case "fertilizer":
      console.log(
        `[applyPerkToCell] Applying fertilizer to cell (${gridCell.x},${gridCell.y})`
      );
      return await tx.gridCell.update({
        where: { fid_x_y: { fid: gridCell.fid, x: gridCell.x, y: gridCell.y } },
        data: { isReadyToHarvest: true },
      });

    case "nitrogen":
    case "potassium":
    case "phosphorus": {
      console.log(
        `[applyPerkToCell] Applying ${itemSlug} boost to cell (${gridCell.x},${gridCell.y})`
      );

      // Validate crop type compatibility
      if (!isValidBoostForCrop(itemSlug, cropType)) {
        console.error(
          `[applyPerkToCell] Invalid ${itemSlug} boost for crop type ${cropType}`
        );
        throw new Error("Invalid perk for this crop type");
      }

      // Check if enough time has passed since last speed boost
      if (gridCell.speedBoostedAt) {
        const lastBoostTime = new Date(gridCell.speedBoostedAt);
        const timeSinceBoost = Date.now() - lastBoostTime.getTime();
        if (timeSinceBoost < SPEED_BOOST[itemSlug as BoostType].duration) {
          console.error(
            `[applyPerkToCell] Cannot apply ${itemSlug} boost yet - previous boost still active`
          );
          throw new Error(
            "Cannot speed boost yet - must wait for boost duration to expire"
          );
        }
      }

      const newHarvestTime = calculateNewHarvestTime(harvestAt!, itemSlug);
      console.log(
        `[applyPerkToCell] New harvest time calculated: ${newHarvestTime.toISOString()}`
      );

      return await tx.gridCell.update({
        where: { fid_x_y: { fid: gridCell.fid, x: gridCell.x, y: gridCell.y } },
        data: {
          speedBoostedAt: new Date().toISOString(),
          harvestAt: newHarvestTime.toISOString(),
        },
      });
    }

    default:
      console.error(`[applyPerkToCell] Unknown perk type: ${itemSlug}`);
      throw new Error("Unknown perk type");
  }
}

// Helper functions for perk validation and calculations
function isValidBoostForCrop(boostType: string, cropType: CropType): boolean {
  switch (boostType) {
    case "nitrogen":
      return [CropType.Carrot, CropType.Wheat, CropType.Radish].includes(
        cropType
      );

    case "potassium":
      return [
        CropType.Lettuce,
        CropType.Tomato,
        CropType.Potato,
        CropType.Corn,
        CropType.Eggplant,
      ].includes(cropType);

    case "phosphorus":
      return [
        CropType.Pumpkin,
        CropType.Watermelon,
        CropType.Strawberry,
      ].includes(cropType);

    default:
      return false;
  }
}

function calculateNewHarvestTime(
  currentHarvestAt: Date,
  boostType: string
): Date {
  const boost = SPEED_BOOST[boostType as BoostType];
  if (!boost) throw new Error("Invalid boost type");

  // Calculate boost time reduction using the same formula as speedBoostGridCell
  const boostTime = boost.duration * (1 - 1 / boost.boost);

  // Return new harvest time by subtracting the boost time
  return new Date(currentHarvestAt.getTime() - boostTime);
}
