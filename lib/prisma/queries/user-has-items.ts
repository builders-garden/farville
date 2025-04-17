import { Item, UserHasItem } from "@prisma/client";
import { prisma } from "../client";

export const getUserItemByItemId = async (
  fid: number,
  itemId: number
): Promise<(UserHasItem & { item: Item }) | null> => {
  const userItem = await prisma.userHasItem.findFirst({
    where: {
      fid,
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
  fid: number,
  category?: string
): Promise<(UserHasItem & { item: Item })[]> => {
  const userItems = await prisma.userHasItem.findMany({
    where: {
      fid,
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
      fid,
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
  fid: number,
  itemId: number,
  quantity: number,
  mode: string
): Promise<UserHasItem> => {
  const updatedItem = await prisma.userHasItem.upsert({
    where: {
      fid_itemId_mode: {
        fid,
        itemId,
        mode,
      },
    },
    update: {
      quantity,
    },
    create: {
      fid,
      itemId,
      quantity,
      mode,
    },
  });

  return updatedItem;
};

export const addUserItem = async (
  fid: number,
  itemId: number,
  quantity: number,
  mode: string
) => {
  return await prisma.userHasItem.upsert({
    where: {
      fid_itemId_mode: {
        fid,
        itemId,
        mode,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      fid,
      itemId,
      quantity,
      mode,
    },
  });
};

export const giftStarterPack = async (fid: number, mode: string) => {
  await addUserItem(fid, 1, 4, mode);
  await addUserItem(fid, 9, 4, mode);
};

export const removeUserItem = async (
  fid: number,
  itemId: number,
  quantity: number,
  mode: string
) => {
  // Use a transaction to prevent race conditions
  return await prisma.$transaction(
    async (tx) => {
      // Decrement the quantity directly
      const updatedItem = await tx.userHasItem.update({
        where: {
          fid_itemId_mode: {
            fid,
            itemId,
            mode,
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
            fid_itemId_mode: {
              fid,
              itemId,
              mode,
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
