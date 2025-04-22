import { Collectible } from "@prisma/client";
import { prisma } from "../client";

export const getCollectibles = async (
  category?: string
): Promise<Collectible[]> => {
  const collectibles = await prisma.collectible.findMany({
    where: category ? { category } : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  return collectibles;
};

export const getCollectibleById = async (
  id: number
): Promise<Collectible | null> => {
  const collectible = await prisma.collectible.findUnique({
    where: { id },
  });

  return collectible;
};
