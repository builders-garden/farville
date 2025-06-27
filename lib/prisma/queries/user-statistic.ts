import { Mode, UserType } from "@/lib/types/game";
import { prisma } from "../client";
import { UserWithStatistic } from "../types";
import { Prisma, UserStatistic } from "@prisma/client";
import { LEVEL_REWARDS, LEVEL_XP_THRESHOLDS } from "@/lib/game-constants";
import { FrameNotificationDetails } from "@farcaster/frame-sdk";

export const getUserByMode = async (
  fid: number,
  mode: Mode
): Promise<UserWithStatistic | null> => {
  const user = await prisma.userStatistic.findUnique({
    where: {
      fid_mode: {
        fid,
        mode,
      },
    },
    include: {
      user: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user.user,
    xp: user.xp,
    coins: user.coins,
    mode: user.mode as Mode,
    expansions: user.expansions,
    notificationDetails:
      typeof user.user.notificationDetails === "string" &&
      user.user.notificationDetails !== ""
        ? (JSON.parse(
            user.user.notificationDetails
          ) as FrameNotificationDetails)
        : null,
    createdAt: user.user.createdAt,
    bot: user.user.bot as UserType,
  };
};

export const getUserModes = async (fid: number): Promise<Mode[]> => {
  const user = await prisma.userStatistic.findMany({
    where: {
      fid,
    },
    select: {
      mode: true,
    },
  });

  return user.map((user) => user.mode as Mode);
};

export const getUserStats = async (
  fid: number
): Promise<Record<Mode, UserStatistic>> => {
  const stats = await prisma.userStatistic.findMany({
    where: {
      fid,
    },
  });

  const statsByMode: Record<Mode, UserStatistic> = {} as Record<
    Mode,
    UserStatistic
  >;
  stats.forEach((stat) => {
    statsByMode[stat.mode as Mode] = stat;
  });
  return statsByMode;
};

export const getPlayerCountByMode = async (mode: Mode) => {
  return await prisma.userStatistic.count({
    where: {
      mode,
      xp: {
        gt: 0,
      },
    },
  });
};

export const getUsersByFidsAndMode = async (
  fids: string[],
  mode: Mode
): Promise<{
  users: UserWithStatistic[];
}> => {
  const users = await prisma.userStatistic.findMany({
    where: {
      fid: {
        in: fids.map(Number), // Convert string[] to number[]
      },
      mode,
    },
    orderBy: {
      xp: "desc",
    },
    include: {
      user: true,
    },
  });

  return {
    users: users.map((user, index) => ({
      ...user,
      ...user.user,
      mode: user.mode as Mode,
      notificationDetails:
        typeof user.user.notificationDetails === "string" &&
        user.user.notificationDetails !== ""
          ? (JSON.parse(
              user.user.notificationDetails
            ) as FrameNotificationDetails)
          : null,
      position: index + 1,
      bot: user.user.bot as UserType,
    })),
  };
};

export const getModePartialLeaderboardFromFids = async (
  fids: string[],
  targetFid: string,
  limit: number = 5,
  mode: Mode
): Promise<(UserWithStatistic & { position: number })[]> => {
  const fullLeaderboard = await getUsersByFidsAndMode(fids, mode);
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
export const getModePartialLeaderboardFromUserPosition = async (
  position: number,
  limit: number = 5,
  mode: Mode
): Promise<(UserWithStatistic & { position: number })[]> => {
  const skip = Math.max(0, position - Math.ceil(limit / 2));
  const partialLeaderboard = await prisma.userStatistic.findMany({
    where: {
      mode,
      xp: {
        gt: 0,
      },
    },
    orderBy: {
      xp: "desc",
    },
    skip,
    take: limit,
    include: {
      user: true,
    },
  });

  return partialLeaderboard.map((user, index) => ({
    ...user,
    ...user.user,
    mode: user.mode as Mode,
    notificationDetails:
      typeof user.user.notificationDetails === "string" &&
      user.user.notificationDetails !== ""
        ? (JSON.parse(
            user.user.notificationDetails
          ) as FrameNotificationDetails)
        : null,
    position: skip + index + 1,
    bot: user.user.bot as UserType,
  }));
};

export const getLeaderboardUserPositionByMode = async (
  targetXp: number,
  mode: Mode
): Promise<number> => {
  const count = await prisma.userStatistic.count({
    where: {
      mode,
      xp: {
        gte: targetXp,
      },
    },
  });
  return count || 0;
};

export const updateUserStatistic = async (
  fid: number,
  updates: Prisma.UserStatisticUpdateInput,
  mode: Mode
): Promise<UserStatistic> => {
  const updatedUser = await prisma.userStatistic.update({
    where: {
      fid_mode: {
        fid,
        mode,
      },
    },
    data: updates,
  });

  return updatedUser;
};

export const updateUserCoins = async (
  fid: number,
  coins: number,
  mode: Mode
) => {
  return await prisma.userStatistic.update({
    where: { fid_mode: { fid, mode } },
    data: { coins: coins },
  });
};

export const getUsersByXp = async (
  mode: Mode,
  limit?: number,
  targetFid?: number
): Promise<{
  users: UserWithStatistic[];
  targetPosition?: number;
}> => {
  // Get users ordered by XP
  const users = await prisma.userStatistic.findMany({
    where: {
      mode,
      xp: {
        gt: 0,
      },
    },
    orderBy: {
      xp: "desc",
    },
    include: {
      user: true,
    },
    ...(limit ? { take: limit } : {}),
  });

  let targetPosition: number | undefined;
  if (targetFid) {
    // Get target user's XP
    const targetUser = await prisma.userStatistic.findUnique({
      where: {
        fid_mode: {
          fid: targetFid,
          mode,
        },
      },
      select: { xp: true },
    });

    if (targetUser) {
      // Count users with higher or equal XP to get position
      targetPosition = await prisma.userStatistic.count({
        where: {
          mode,
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
      ...user.user,
      mode: user.mode as Mode,
      createdAt: user.user.createdAt,
      notificationDetails:
        typeof user.user.notificationDetails === "string" &&
        user.user.notificationDetails !== ""
          ? (JSON.parse(
              user.user.notificationDetails
            ) as FrameNotificationDetails)
          : null,
      bot: user.user.bot as UserType,
    })),
    targetPosition,
  };
};

export const updateUserXP = async (
  fid: number,
  xp: number,
  mode: Mode
): Promise<{
  user: UserWithStatistic;
  didLevelUp: boolean;
  newXP: number;
  newLevel: number;
  oldXp: number;
}> => {
  return await prisma.$transaction(
    async (tx) => {
      // Get current user data with a lock
      const currentUser = await tx.userStatistic.findUnique({
        where: { fid_mode: { fid, mode } },
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
      const user = await tx.userStatistic.update({
        where: { fid_mode: { fid, mode } },
        data: {
          xp: { increment: xp },
          ...(didLevelUp && {
            coins: { increment: LEVEL_REWARDS[newLevel - 1].coins },
          }),
        },
        include: {
          user: true,
        },
      });

      return {
        user: {
          ...user,
          ...user.user,
          mode: user.mode as Mode,
          createdAt: user.user.createdAt,
          notificationDetails:
            typeof user.user.notificationDetails === "string" &&
            user.user.notificationDetails !== ""
              ? (JSON.parse(
                  user.user.notificationDetails
                ) as FrameNotificationDetails)
              : null,
          bot: user.user.bot as UserType,
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

export const createUserStatistic = async (
  fid: number,
  mode: Mode
): Promise<UserStatistic> => {
  const userStatistic = await prisma.userStatistic.create({
    data: {
      fid,
      mode,
      xp: 0,
      coins: 0,
      expansions: 1,
    },
  });

  return userStatistic;
};
