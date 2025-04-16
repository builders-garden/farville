import { prisma } from "../client";
import { Prisma } from "@prisma/client";
import { DbUser } from "../types";
import { LEVEL_REWARDS, LEVEL_XP_THRESHOLDS } from "@/lib/game-constants";

export const getUser = async (fid: number) => {
  const user = await prisma.user.findUnique({
    where: {
      fid,
    },
  });

  if (!user) {
    return null;
  }

  return user;
};

export const getPlayerCount = async () => {
  return await prisma.user.count({
    where: {
      xp: {
        gt: 0,
      },
    },
  });
};

export const getUsersByFids = async (
  fids: string[]
): Promise<{
  users: DbUser[];
}> => {
  const users = await prisma.user.findMany({
    where: {
      fid: {
        in: fids.map(Number), // Convert string[] to number[]
      },
    },
    orderBy: {
      xp: "desc",
    },
  });

  return {
    users: users.map((user, index) => ({
      ...user,
      createdAt: user.createdAt,
      position: index + 1,
    })),
  };
};

export const getPartialLeaderboardFromFids = async (
  fids: string[],
  targetFid: string,
  limit: number = 5
) => {
  const fullLeaderboard = await getUsersByFids(fids);
  const targetIndex = fullLeaderboard.users.findIndex(
    (user) => user.fid === Number(targetFid)
  );

  if (targetIndex === -1) {
    return [];
  }

  const start = Math.max(0, targetIndex - Math.floor(limit / 2));
  const end = Math.min(start + limit, fullLeaderboard.users.length);

  return fullLeaderboard.users.slice(start, end).map((user, index) => ({
    ...user,
    position: start + index + 1,
  }));
};

// this function is used to get the leaderboard with a limit number of users
// where the fid of the user is exactly in the middle of this partial leaderboard
// the limit is the number of users to be returned
export const getPartialLeaderboardFromUserPosition = async (
  position: number,
  limit: number = 5
) => {
  const skip = Math.max(0, position - Math.ceil(limit / 2));
  const partialLeaderboard = await prisma.user.findMany({
    where: {
      xp: {
        gt: 0,
      },
    },
    orderBy: {
      xp: "desc",
    },
    skip,
    take: limit,
  });

  return partialLeaderboard.map((user, index) => ({
    ...user,
    position: skip + index + 1,
  }));
};

export const getUserPosition = async (targetXp: number): Promise<number> => {
  const count = await prisma.user.count({
    where: {
      xp: {
        gte: targetXp,
      },
    },
  });
  return count || 0;
};

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
    data: { coins: coins },
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

export const updateUserXP = async (
  fid: number,
  xp: number
): Promise<{
  user: DbUser;
  didLevelUp: boolean;
  newXP: number;
  newLevel: number;
  oldXp: number;
}> => {
  return await prisma.$transaction(
    async (tx) => {
      // Get current user data with a lock
      const currentUser = await tx.user.findUnique({
        where: { fid },
        select: { xp: true, coins: true },
      });

      if (!currentUser) throw new Error("User not found");

      const currentXP = currentUser.xp;
      const newXP = currentXP + xp;

      let currentLevel = LEVEL_XP_THRESHOLDS.findIndex(
        (threshold) => currentXP < threshold
      );
      if (currentLevel === -1) {
        currentLevel = LEVEL_XP_THRESHOLDS.length;
      }
      let newLevel = LEVEL_XP_THRESHOLDS.findIndex(
        (threshold) => newXP < threshold
      );
      if (newLevel === -1) {
        newLevel = LEVEL_XP_THRESHOLDS.length;
      }
      const didLevelUp = newLevel > currentLevel;

      // Update user XP and potentially coins if leveled up
      const user = await tx.user.update({
        where: { fid },
        data: {
          xp: { increment: xp },
          ...(didLevelUp && {
            coins: { increment: LEVEL_REWARDS[newLevel - 1].coins },
          }),
        },
      });

      return {
        user: {
          ...user,
          createdAt: user.createdAt,
        },
        didLevelUp,
        newXP,
        oldXp: currentXP,
        newLevel,
      };
    },
    {
      maxWait: 14000,
      timeout: 14000,
    }
  );
};
