import { CREATOR_FIDS, LEVEL_XP_THRESHOLDS } from "@/lib/game-constants";
import { prisma } from "../client";
import { UserLeaderboardEntry } from "@prisma/client";
import { Mode } from "@/lib/types/game";
import { MODE_DEFINITIONS, ModeFeature } from "@/lib/modes/constants";

export const createUserLeaderboardEntry = async (
  fid: number,
  data: Partial<UserLeaderboardEntry>,
  mode: Mode
) => {
  return await prisma.userLeaderboardEntry.create({
    data: {
      fid,
      mode,
      ...data,
    },
  });
};

export const updateUserLeaderboardEntry = async (
  fid: number,
  mode: Mode,
  data: Partial<UserLeaderboardEntry>
) => {
  return await prisma.userLeaderboardEntry.update({
    where: {
      fid_mode: { fid, mode },
    },
    data,
  });
};

export const getUserLeaderboardEntry = async (fid: number, mode: Mode) => {
  return await prisma.userLeaderboardEntry.findUnique({
    where: {
      fid_mode: {
        fid,
        mode,
      },
    },
  });
};

export const getWeeklyLeaderboardUsersByLeague = async (
  league: number,
  mode: Mode
) => {
  const userCount = await prisma.userLeaderboardEntry.count({
    where: {
      mode,
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
  mode: Mode,
  targetFid?: number
) => {
  const filter = {
    where: {
      mode,
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

  const leaderboard = await prisma.userLeaderboardEntry.findMany(filter);

  let targetPosition: number | undefined;
  if (targetFid) {
    if (!CREATOR_FIDS.includes(targetFid)) {
      // TODO: fix this mode constraint
      const targetEntry = await prisma.userLeaderboardEntry.findUnique({
        where: { fid_mode: { fid: targetFid, mode: Mode.Classic } },
      });

      if (!targetEntry) {
        throw new Error("Target user not found in leaderboard");
      }

      targetPosition = await prisma.userLeaderboardEntry.count({
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
  didLevelUp: boolean = false,
  mode: Mode
): Promise<{
  currentScore: number;
}> => {
  if (!MODE_DEFINITIONS[mode].features.includes(ModeFeature.Leagues)) {
    return {
      currentScore: 0,
    };
  }

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
        const currentLeaderboardEntry =
          await tx.userLeaderboardEntry.findUnique({
            // TODO: fix this mode constraint
            where: { fid_mode: { fid, mode } },
            select: { currentScore: true },
          });

        if (!currentLeaderboardEntry)
          throw new Error("User leaderboard entry not found");

        const newScore =
          currentLeaderboardEntry.currentScore + weeklyScoreToAdd;

        // Update user's current score
        // TODO: fix this mode constraint
        const updatedEntry = await tx.userLeaderboardEntry.update({
          where: { fid_mode: { fid, mode } },
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
