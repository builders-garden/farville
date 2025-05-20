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
