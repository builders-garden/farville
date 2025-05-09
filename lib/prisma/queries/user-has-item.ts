import { Item, UserHasItem } from "@prisma/client";
import { prisma } from "../client";
import { Mode } from "@/lib/types/game";
import { STARTER_PACKS } from "@/lib/modes/constants";
import { getUsersByMode } from "./user-statistic";

export const getUserItemByItemId = async (
  fid: number,
  itemId: number,
  mode: Mode
): Promise<(UserHasItem & { item: Item }) | null> => {
  const userItem = await prisma.userHasItem.findFirst({
    where: {
      fid,
      mode,
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
  mode: Mode,
  category?: string
): Promise<(UserHasItem & { item: Item })[]> => {
  const userItems = await prisma.userHasItem.findMany({
    where: {
      fid,
      OR: [
        {
          mode,
          ...(category && {
            item: {
              category,
            },
          }),
        },
        {
          mode: Mode.Classic,
          item: {
            category: {
              in: ["special", "special-crop"],
            },
          },
        },
      ],
    },
    include: {
      item: true,
    },
  });

  return userItems;
};

export const getUserItemBySlug = async (
  fid: number,
  slug: string,
  mode: Mode
): Promise<UserHasItem | null> => {
  const userItem = await prisma.userHasItem.findFirst({
    where: {
      fid,
      mode,
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
  mode: Mode
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
  mode: Mode
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

export const addUserItemToAll = async (
  itemId: number,
  quantity: number,
  mode: Mode
) => {
  // Get all users
  const users = await getUsersByMode(mode);
  if (!users || users.length === 0) {
    throw new Error("No users found");
  }

  // Distribute items to all users without using addUserItem
  const promises = users.map((user) =>
    prisma.userHasItem.upsert({
      where: {
        fid_itemId_mode: {
          fid: user.fid,
          itemId,
          mode,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        fid: user.fid,
        itemId,
        quantity,
        mode,
      },
    })
  );
  await Promise.all(promises);
  return users;
};

export const giftStarterPack = async (fid: number, mode: Mode) => {
  const starterPack = STARTER_PACKS[mode];
  if (!starterPack) {
    throw new Error(`No starter pack found for mode: ${mode}`);
  }

  // add user items based on the starter pack
  for (const item of starterPack) {
    await addUserItem(fid, item.itemId, item.quantity, mode);
  }
  // await addUserItem(fid, 1, 4, mode);
  // await addUserItem(fid, 9, 4, mode);
};

export const removeUserItem = async (
  fid: number,
  itemId: number,
  quantity: number,
  mode: Mode
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
