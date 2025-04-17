import { prisma } from "../client";
import { UserHasCollectible, Collectible } from "@prisma/client";

export const getUserCollectibles = async (
  fid: number
): Promise<
  (Collectible & { userHasCollectibles: UserHasCollectible | null })[]
> => {
  const collectibles = await prisma.collectible.findMany({
    include: {
      collectibles: {
        where: {
          fid: fid,
        },
      },
    },
  });

  return collectibles.map((collectible) => ({
    ...collectible,
    userHasCollectibles: collectible.collectibles[0] || null,
  }));
};
