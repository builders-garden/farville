import { prisma } from "../client";
import { getCurrentCommunityBooster } from "./user-community-booster-history";
import { getCurrentPowerStage } from "@/lib/utils";

export const getCommunityBoosterPoints = async (): Promise<number> => {
  const communityBooster = await prisma.communityBoosterPoints.findFirst();

  if (!communityBooster) {
    // create a new entry if it doesn't exist
    const newBooster = await prisma.communityBoosterPoints.create({
      data: {
        points: 0,
      },
    });
    return newBooster.points;
  }

  return communityBooster.points;
};

export const incrementCommunityBoosterPoints = async (
  pointsToAdd: number
): Promise<number> => {
  const currentCommunityBoosterStatus = await getCurrentCommunityBooster();
  const currentPoints = await getCommunityBoosterPoints();

  await prisma.communityBoosterPoints.updateMany({
    data: { points: { increment: pointsToAdd } },
  });

  const stageAfterIncrement = getCurrentPowerStage(currentPoints + pointsToAdd);

  // Check if the stage has changed
  if (currentCommunityBoosterStatus?.stage !== stageAfterIncrement) {
    await prisma.userCommunityBoosterHistory.create({
      data: {
        mode: currentCommunityBoosterStatus?.mode,
        stage: stageAfterIncrement,
      },
    });

    // TODO: step 1: send async harvestAt reset to the server
    // TODO: step 2: send a notification to all the users
  }

  return currentPoints + pointsToAdd;
};

export const decrementCommunityBoosterPoints = async (
  pointsToSubtract: number
): Promise<number> => {
  const currentCommunityBoosterStatus = await getCurrentCommunityBooster();
  const currentPoints = await getCommunityBoosterPoints();

  await prisma.communityBoosterPoints.updateMany({
    data: { points: { decrement: pointsToSubtract } },
  });

  const stageAfterDecrement = getCurrentPowerStage(
    currentPoints - pointsToSubtract
  );

  // Check if the stage has changed
  if (currentCommunityBoosterStatus?.stage !== stageAfterDecrement) {
    await prisma.userCommunityBoosterHistory.create({
      data: {
        mode: currentCommunityBoosterStatus?.mode,
        stage: stageAfterDecrement,
      },
    });
  }

  return currentPoints - pointsToSubtract;
};
