import { prisma } from "../client";

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
  await prisma.communityBoosterPoints.updateMany({
    data: { points: { increment: pointsToAdd } },
  });

  // Get the updated points value after the update
  const currentPoints = await prisma.communityBoosterPoints.findFirst();
  return currentPoints?.points ?? 0;
};

export const decrementCommunityBoosterPoints = async (
  pointsToSubtract: number
): Promise<number> => {
  await prisma.communityBoosterPoints.updateMany({
    data: { points: { decrement: pointsToSubtract } },
  });

  // Get the updated points value after the update
  const currentPoints = await prisma.communityBoosterPoints.findFirst();
  return currentPoints?.points ?? 0;
};
