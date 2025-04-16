import { CREATOR_FIDS, LEVEL_XP_THRESHOLDS } from "@/lib/game-constants";
import { prisma } from "../client";
import { UserLeaderboards } from "@prisma/client";

export const createUserLeaderboardEntry = async (
  fid: number,
  data: Partial<UserLeaderboards>
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
  data: Partial<UserLeaderboards>
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

export const getWeeklyLeaderboardUsersByLeague = async (league: number) => {
  const userCount = await prisma.userLeaderboards.count({
    where: {
      league,
      currentScore: {
        gt: 0,
      },
    },
  });

  return userCount;
};

export const getWeeklyUserLeaderboardByLeague = async (
  league: number,
  currentWeek: boolean,
  limit: number = 10,
  targetFid?: number
) => {
  const filter = {
    where: {
      league: currentWeek ? league : undefined,
      fid: {
        not: {
          in: CREATOR_FIDS,
        },
      },
      lastLeague: currentWeek ? undefined : league,
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
    if (!CREATOR_FIDS.includes(targetFid)) {
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
          fid: {
            not: {
              in: CREATOR_FIDS,
            },
          },
        },
      });
    } else {
      targetPosition = -1;
    }
  }

  return {
    users: leaderboard,
    targetPosition,
  };
};

export const updateUserWeeklyScore = async (
  fid: number,
  score: number,
  userLevel: number,
  currentUserXp: number,
  didLevelUp: boolean = false
): Promise<{
  currentScore: number;
}> => {
  const level5 = LEVEL_XP_THRESHOLDS[4];

  if (userLevel >= 5) {
    let weeklyScoreToAdd = 0;
    if (didLevelUp && userLevel === 5) {
      weeklyScoreToAdd = currentUserXp + score - level5;
    } else {
      weeklyScoreToAdd = score;
    }

    return await prisma.$transaction(
      async (tx) => {
        // Get current user data with a lock
        const currentLeaderboardEntry = await tx.userLeaderboards.findUnique({
          where: { fid },
          select: { currentScore: true },
        });

        if (!currentLeaderboardEntry)
          throw new Error("User leaderboard entry not found");

        const newScore =
          currentLeaderboardEntry.currentScore + weeklyScoreToAdd;

        // Update user's current score
        const updatedEntry = await tx.userLeaderboards.update({
          where: { fid },
          data: {
            currentScore: { increment: weeklyScoreToAdd },
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
  } else {
    return {
      currentScore: 0,
    };
  }
};
