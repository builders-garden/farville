import { UserHasItem } from "@prisma/client";
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

export const getUserItemBySlug = async (
  fid: number,
  slug: string
): Promise<UserHasItem | null> => {
  const userItem = await prisma.userHasItem.findFirst({
    where: {
      userFid: fid,
      item: {
        slug: slug,
      },
    },
    include: {
      item: true,
    },
  });

  if (!userItem) {
    return null;
  }

  return userItem;
};

export const updateUserItem = async (
  userFid: number,
  itemId: number,
  quantity: number
): Promise<DbUserHasItem> => {
  const updatedItem = await prisma.userHasItem.upsert({
    where: {
      userFid_itemId: {
        userFid,
        itemId,
      },
    },
    update: {
      quantity,
    },
    create: {
      userFid,
      itemId,
      quantity,
    },
  });

  return updatedItem;
};

export const addUserItem = async (
  fid: number,
  itemId: number,
  quantity: number
) => {
  return await prisma.userHasItem.upsert({
    where: {
      userFid_itemId: {
        userFid: fid,
        itemId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userFid: fid,
      itemId,
      quantity,
    },
  });
};

export const giftStarterPack = async (userFid: number) => {
  await addUserItem(userFid, 1, 4);
  await addUserItem(userFid, 9, 4);
};

export const removeUserItem = async (
  fid: number,
  itemId: number,
  quantity: number
) => {
  // Use a transaction to prevent race conditions
  return await prisma.$transaction(
    async (tx) => {
      // Decrement the quantity directly
      const updatedItem = await tx.userHasItem.update({
        where: {
          userFid_itemId: {
            userFid: fid,
            itemId,
          },
        },
        data: {
          quantity: { decrement: quantity },
        },
      });

      // If the quantity drops to 0 or below, delete the record
      if (updatedItem.quantity <= 0) {
        await tx.userHasItem.delete({
          where: {
            userFid_itemId: {
              userFid: fid,
              itemId,
            },
          },
        });
      }

      return updatedItem;
    },
    {
      maxWait: 14000,
      timeout: 14000,
    }
  );
};
