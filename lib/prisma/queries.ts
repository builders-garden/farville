import { prisma } from "./client";

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
