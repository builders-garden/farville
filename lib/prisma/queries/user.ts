import { prisma } from "../client";
import { Prisma } from "@prisma/client";
import { DbUser } from "../types";

export const createUser = async (
  user: Prisma.UserCreateInput
): Promise<DbUser> => {
  const newUser = await prisma.user.create({
    data: user,
  });

  return newUser;
};

export const updateUser = async (
  fid: number,
  updates: Prisma.UserUpdateInput
): Promise<DbUser> => {
  const updatedUser = await prisma.user.update({
    where: {
      fid,
    },
    data: updates,
  });

  return updatedUser;
};

export const updateUserCoins = async (fid: number, coins: number) => {
  return await prisma.user.update({
    where: { fid },
    data: { coins: { increment: coins } },
  });
};

export const getUsersByXp = async (
  limit?: number,
  targetFid?: number
): Promise<{
  users: DbUser[];
  targetPosition?: number;
}> => {
  // Get users ordered by XP
  const users = await prisma.user.findMany({
    where: {
      xp: {
        gt: 0,
      },
    },
    orderBy: {
      xp: "desc",
    },
    ...(limit ? { take: limit } : {}),
  });

  let targetPosition: number | undefined;
  if (targetFid) {
    // Get target user's XP
    const targetUser = await prisma.user.findUnique({
      where: { fid: targetFid },
      select: { xp: true },
    });

    if (targetUser) {
      // Count users with higher or equal XP to get position
      targetPosition = await prisma.user.count({
        where: {
          xp: {
            gte: targetUser.xp,
          },
        },
      });
    }
  }

  return {
    users: users.map((user) => ({
      ...user,
      createdAt: user.createdAt,
    })),
    targetPosition,
  };
};
