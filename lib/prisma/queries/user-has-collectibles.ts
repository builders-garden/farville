import { prisma } from "../client";
import { UserHasCollectibles, Collectibles } from "@prisma/client";

export const getUserCollectibles = async (
  fid: number
): Promise<
  (Collectibles & { userHasCollectibles: UserHasCollectibles | null })[]
> => {
  const collectibles = await prisma.collectibles.findMany({
    include: {
      userHasCollectibles: {
        where: {
          fid: fid,
        },
      },
    },
  });

  return collectibles.map((collectible) => ({
    ...collectible,
    userHasCollectibles: collectible.userHasCollectibles[0] || null,
  }));
};
