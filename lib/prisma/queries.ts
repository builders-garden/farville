import { prisma } from "./client";
import { LEVEL_XP_THRESHOLDS, LEVEL_REWARDS } from "@/lib/game-constants";
import {
  DbGridCell,
  DbStreak,
  DbUser,
  DbUserDonation,
  DbUserFrost,
  DbUserLeaderboard,
} from "@/supabase/types";
import { UserHasItem } from "@prisma/client";
import { getCurrentDayStreak } from "../utils";

export async function getQuestLeaderboard({
  limit,
  fids,
  targetFid,
}: {
  limit?: number;
  fids?: string[];
  targetFid?: string;
}) {
  // If no specific fids provided and targetFid exists, we need full leaderboard data
  const needsFullLeaderboard = !fids && targetFid;

  // Get quests grouped by fid, ordered by count, excluding incomplete
  const groupedQuests = await prisma.userHasQuest.groupBy({
    by: ["fid"],
    _count: {
      fid: true,
    },
    where: {
      status: {
        not: "incomplete",
      },
      ...(fids ? { fid: { in: fids.map(Number) } } : {}),
    },
    orderBy: {
      _count: {
        fid: "desc",
      },
    },
    // Only apply limit if we don't need full leaderboard for position calculation
    ...(!needsFullLeaderboard && limit ? { take: limit } : {}),
  });

  // Get the fids from grouped quests
  const userFids = groupedQuests.map((quest) => quest.fid);

  // Fetch users data for these fids
  const users = await prisma.user.findMany({
    where: {
      fid: {
        in: userFids,
      },
    },
    select: {
      fid: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  });

  // Combine quest counts with user data and sort
  const leaderboard = users
    .map((user) => ({
      ...user,
      questCount:
        groupedQuests.find((quest) => quest.fid === user.fid)?._count.fid || 0,
    }))
    .sort((a, b) => b.questCount - a.questCount);

  // If we need target position, find it in the full leaderboard
  if (needsFullLeaderboard) {
    const targetPosition = leaderboard.findIndex(
      (user) => user.fid === Number(targetFid)
    );

    // Return limited leaderboard with target position
    return {
      users: leaderboard.slice(0, limit),
      targetPosition: targetPosition !== -1 ? targetPosition + 1 : null,
      questCount: leaderboard.find((user) => user.fid === Number(targetFid))
        ?.questCount,
    };
  }

  // Return just the leaderboard if no position needed
  return leaderboard;
}

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

export const updateUserXP = async (
  fid: number,
  xp: number
): Promise<{
  user: DbUser;
  didLevelUp: boolean;
  newXP: number;
  newLevel: number;
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

      const currentLevel = LEVEL_XP_THRESHOLDS.findIndex(
        (threshold) => currentXP < threshold
      );
      const newLevel = LEVEL_XP_THRESHOLDS.findIndex(
        (threshold) => newXP < threshold
      );
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
          createdAt: user.createdAt.toISOString(),
        },
        didLevelUp,
        newXP,
        newLevel,
      };
    },
    {
      maxWait: 14000,
      timeout: 14000,
    }
  );
};

export const updateUserCoins = async (fid: number, coins: number) => {
  return await prisma.user.update({
    where: { fid },
    data: { coins: { increment: coins } },
  });
};

export const updateGridCellsBulk = async (fid: number, cells: DbGridCell[]) => {
  return await prisma.$transaction(
    async (tx) => {
      const updatedCells: DbGridCell[] = [];
      for (const cell of cells) {
        const updatedCell = await tx.gridCell.update({
          where: { fid_x_y: { fid, x: cell.x, y: cell.y } },
          data: cell,
        });
        updatedCells.push({
          ...updatedCell,
          plantedAt: updatedCell.plantedAt?.toISOString() || null,
          harvestAt: updatedCell.harvestAt?.toISOString() || null,
          speedBoostedAt: updatedCell.speedBoostedAt?.toISOString() || null,
          createdAt: updatedCell.createdAt.toISOString(),
        });
      }
      return updatedCells;
    },
    {
      maxWait: 14000,
      timeout: 14000,
    }
  );
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

export const getUserDonationsHistory = async ({
  donatorFid,
  receiverFid,
  limit = 1,
}: {
  donatorFid: number;
  receiverFid?: number;
  limit?: number;
}) => {
  return await prisma.userDonationHistory.findMany({
    where: {
      donatorFid,
      ...(receiverFid && { receiverFid }),
    },
    orderBy: {
      lastDonation: "desc",
    },
    take: limit,
  });
};

// this function is used to return the last donation made by a user to a specific receiver
export const getUserDonationByReceiver = async (
  donator: number,
  receiver: number
) => {
  return await prisma.userDonationHistory.findFirst({
    where: {
      donatorFid: donator,
      receiverFid: receiver,
    },
  });
};

export const getUserDonationsLast24h = async (donatorFid: number) => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return (
    await prisma.userDonationHistory.findMany({
      where: {
        donatorFid,
        lastDonation: {
          gte: last24h,
        },
      },
      orderBy: {
        lastDonation: "desc",
      },
    })
  ).length;
};

export const updateUserDonationHistory = async (
  userDonation: DbUserDonation
) => {
  return await prisma.userDonationHistory.upsert({
    where: {
      donatorFid_receiverFid: {
        donatorFid: userDonation.donatorFid,
        receiverFid: userDonation.receiverFid,
      },
    },
    update: userDonation,
    create: userDonation,
  });
};

export const getUserStreaks = async (fid: number) => {
  return await prisma.streaks.findMany({
    where: {
      fid,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
};

export const createUserStreak = async (fid: number) => {
  return await prisma.streaks.create({
    data: {
      fid,
      startedAt: new Date(),
      lastActionAt: new Date(),
    },
  });
};

export const updateUserStreak = async (
  streakId: number,
  data: Partial<DbStreak>
) => {
  return await prisma.streaks.update({
    where: { id: streakId },
    data,
  });
};

export const updateStreakLastClaimed = async (streakId: number) => {
  return await prisma.streaks.update({
    where: { id: streakId },
    data: {
      lastClaimed: { increment: 1 },
    },
  });
};

export const applyUserFrost = async (
  fid: number,
  streakId: number,
  from: Date,
  amount: number,
  frostItemId: number
) => {
  const records = Array.from({ length: amount }, (_, i) => {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    return {
      streakId,
      frozenAt: date,
    };
  });
  try {
    await prisma.userFrosts.createMany({
      data: records,
    });
    await removeUserItem(fid, frostItemId, amount);
  } catch (error) {
    console.error("Error creating user frosts:", error);
    throw new Error("Failed to apply user frost");
  }
};

export const getUserFrosts = async (fid: number) => {
  const streaks = await getUserStreaks(fid);
  const streakIds = streaks.map((streak) => streak.id);

  if (streakIds.length === 0) {
    return {
      allFrostsDates: [],
      lastStreakDates: [],
    };
  }

  const userFrosts: DbUserFrost[] = await prisma.userFrosts.findMany({
    where: {
      streakId: {
        in: streakIds,
      },
    },
    orderBy: {
      frozenAt: "asc",
    },
  });

  const allFrostsDates = userFrosts.map((frost) => new Date(frost.frozenAt));

  const lastStreakId = streaks[0]?.id;
  const lastStreakFrosts = userFrosts.filter(
    (frost) => frost.streakId === lastStreakId
  );
  const lastStreakDates = lastStreakFrosts.map(
    (frost) => new Date(frost.frozenAt)
  );

  return {
    allFrostsDates,
    lastStreakDates,
  };
};

export const getUserFrostsByStreakId = async (streakId: number) => {
  return await prisma.userFrosts.findMany({
    where: {
      streakId,
    },
    orderBy: {
      frozenAt: "desc",
    },
  });
};

export const getUserCurrentStreakNumber = async (fid: number) => {
  const streaks = await getUserStreaks(fid);
  const currentStreak = streaks[0];
  if (!currentStreak) {
    return 0;
  }

  const frostDays = (await getUserFrostsByStreakId(currentStreak.id)).map(
    (frost) => new Date(frost.frozenAt)
  );
  const currentStreakNumber = getCurrentDayStreak(currentStreak, frostDays);

  return currentStreakNumber;
};

export interface TopStreaksResult {
  id: number;
  fid: number;
  startedAt: string;
  lastActionAt: string;
  frozen_days: number;
  streak_length: number;
}

export const getTopStreaks = async () => {
  const topStreaks = await prisma.$queryRaw`
    WITH streak_durations AS (
      SELECT 
        s.id,
        s.fid,
        s."startedAt",
        s."lastActionAt",
        COUNT(f."frozenAt") AS frozen_days,
        LEAST(
          (s."lastActionAt" - s."startedAt") + 1, 
          (CURRENT_DATE - s."startedAt") + 1 - COUNT(f."frozenAt")
        ) AS streak_length
      FROM public.streaks s
      LEFT JOIN public.user_frosts f ON s.id = f."streakId"
      WHERE s."endedAt" IS NULL
      GROUP BY s.id, s.fid, s."startedAt", s."lastActionAt"
    )
    SELECT * FROM streak_durations
    ORDER BY streak_length DESC
    LIMIT 5;
  `;

  return topStreaks as TopStreaksResult[];
};

interface StreaksCountResult {
  active_streaks_count: number;
}

export const getActiveStreaksCount = async (): Promise<number> => {
  const result = await prisma.$queryRaw<StreaksCountResult[]>`
    SELECT COUNT(*) AS active_streaks_count
    FROM public.streaks s
    WHERE s."endedAt" IS NULL
      AND s."lastActionAt" >= CURRENT_DATE - INTERVAL '3 days';
  `;

  return result[0].active_streaks_count; // Return the count from the result
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
      xp: {
        gt: 0,
      },
    },
    orderBy: {
      xp: "desc",
    },
  });

  return {
    users: users.map((user, index) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      position: index + 1,
    })),
  };
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

export async function getQuestPartialLeaderboard({
  targetFid,
  limit = 5,
}: {
  targetFid: string;
  limit?: number;
}) {
  const fullLeaderboard = (await getQuestLeaderboard({})) as {
    questCount: number;
    fid: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  }[];
  const targetIndex = fullLeaderboard.findIndex(
    (user) => user.fid === Number(targetFid)
  );

  if (targetIndex === -1) {
    return [];
  }

  const start = Math.max(0, targetIndex - Math.floor(limit / 2));
  const end = Math.min(start + limit, fullLeaderboard.length);

  return fullLeaderboard.slice(start, end).map((user, index) => ({
    ...user,
    position: start + index + 1,
  }));
}

export async function getQuestPartialLeaderboardFromFids({
  fids,
  targetFid,
  limit = 5,
}: {
  fids: string[];
  targetFid: string;
  limit?: number;
}) {
  const fullLeaderboard = (await getQuestLeaderboard({
    fids,
    targetFid,
  })) as {
    fid: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    questCount: number;
  }[];

  const targetIndex = fullLeaderboard.findIndex(
    (user) => user.fid === Number(targetFid)
  );

  if (targetIndex === -1) {
    return [];
  }

  const start = Math.max(0, targetIndex - Math.floor(limit / 2));
  const end = Math.min(start + limit, fullLeaderboard.length);

  return fullLeaderboard.slice(start, end).map((user, index) => ({
    ...user,
    position: start + index + 1,
  }));
}

export const getUser = async (fid: number) => {
  const user = await prisma.user.findUnique({
    where: {
      fid,
      xp: {
        gt: 0,
      },
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
      createdAt: user.createdAt.toISOString(),
    })),
    targetPosition,
  };
};

export const createUserLeaderboardEntry = async (
  fid: number,
  data: Partial<DbUserLeaderboard>
) => {
  return await prisma.userLeaderboards.create({
    data: {
      fid,
      ...data,
    },
  });
};

export const updateUserLeaderboardEntry = async (
  fid: number,
  data: Partial<DbUserLeaderboard>
) => {
  return await prisma.userLeaderboards.update({
    where: { fid },
    data,
  });
};

export const getUserLeaderboardEntry = async (fid: number) => {
  return await prisma.userLeaderboards.findUnique({
    where: { fid },
  });
};

export const getWeeklyUserLeaderboardByLeague = async (
  league: number,
  currentWeek: boolean,
  limit: number = 10,
  targetFid?: number
) => {
  const filter = {
    where: {
      league,
    },
    orderBy: currentWeek
      ? { currentScore: "desc" as const }
      : { lastScore: "desc" as const },
    take: limit,
    include: {
      user: true,
    },
  };

  const leaderboard = await prisma.userLeaderboards.findMany(filter);

  let targetPosition: number | undefined;
  if (targetFid) {
    const targetEntry = await prisma.userLeaderboards.findUnique({
      where: { fid: targetFid },
    });

    if (!targetEntry) {
      throw new Error("Target user not found in leaderboard");
    }

    targetPosition = await prisma.userLeaderboards.count({
      where: {
        league,
        [currentWeek ? "currentScore" : "lastScore"]: {
          gte: targetEntry[currentWeek ? "currentScore" : "lastScore"],
        },
      },
    });
  }

  return {
    users: leaderboard,
    targetPosition,
  };
};

export const updateUserWeeklyScore = async (
  fid: number,
  score: number
): Promise<{
  currentScore: number;
}> => {
  return await prisma.$transaction(
    async (tx) => {
      // Get current user data with a lock
      const currentLeaderboardEntry = await tx.userLeaderboards.findUnique({
        where: { fid },
        select: { currentScore: true },
      });

      if (!currentLeaderboardEntry)
        throw new Error("User leaderboard entry not found");

      const newScore = currentLeaderboardEntry.currentScore + score;

      // Update user's current score
      const updatedEntry = await tx.userLeaderboards.update({
        where: { fid },
        data: {
          currentScore: { increment: score },
        },
      });

      return {
        user: updatedEntry,
        currentScore: newScore,
      };
    },
    {
      maxWait: 14000,
      timeout: 14000,
    }
  );
};
