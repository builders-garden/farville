import { prisma } from "../client";
import { DbItem, DbUserHasItem } from "../types";

export const getUserItemByItemId = async (
  userFid: number,
  itemId: number
): Promise<(DbUserHasItem & { item: DbItem }) | null> => {
  const userItem = await prisma.userHasItem.findFirst({
    where: {
      userFid,
      itemId,
      quantity: {
        gte: 1,
      },
    },
    include: {
      item: true,
    },
  });

  return userItem;
};

export const getUserItems = async (
  userFid: number,
  category?: string
): Promise<(DbUserHasItem & { item: DbItem })[]> => {
  const userItems = await prisma.userHasItem.findMany({
    where: {
      userFid,
      ...(category && {
        item: {
          category,
        },
      }),
    },
    include: {
      item: true,
    },
  });

  return userItems;
};
