import { Mode } from "@/lib/types/game";
import { prisma } from "../client";

export const getCommunityBoosterPoints = async (
  mode: Mode
): Promise<{
  points: number;
  combo: number;
}> => {
  const communityBooster = await prisma.communityBoosterPoints.findFirst({
    where: {
      mode,
    },
  });

  if (!communityBooster) {
    // create a new entry if it doesn't exist
    const newBooster = await prisma.communityBoosterPoints.create({
      data: {
        points: 0,
        mode,
      },
    });
    return { points: newBooster.points, combo: newBooster.combo };
  }

  return { points: communityBooster.points, combo: communityBooster.combo };
};
