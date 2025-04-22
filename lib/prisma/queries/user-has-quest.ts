import { Prisma, Quest, UserHasQuest } from "@prisma/client";
import { prisma } from "../client";
import { Mode, QuestStatus, QuestType } from "@/lib/types/game";

interface QuestFilters {
  category?: string;
  itemId?: number;
  type?: QuestType[];
  status?: QuestStatus;
  activeToday?: boolean;
  timeToCompare?: Date;
}

interface QuestIncludes {
  quest?: boolean;
  item?: boolean;
}

export const getUserHasQuests = async (
  fid: number,
  mode: Mode = Mode.Classic,
  filters: QuestFilters = {},
  includes: QuestIncludes = { quest: true }
) => {
  const timeToCompare = filters.timeToCompare || new Date();

  const questWhere: Prisma.QuestWhereInput = {};
  const whereClause: Prisma.UserHasQuestWhereInput = {
    fid,
    mode,
    quest: questWhere,
  };

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.activeToday || filters.timeToCompare) {
    questWhere.startAt = { lte: timeToCompare };
    questWhere.endAt = { gte: timeToCompare };
  }

  if (filters.itemId) {
    questWhere.itemId = filters.itemId;
  }

  if (filters.category) {
    questWhere.category = filters.category;
  }

  if (filters.type) {
    questWhere.type = { in: filters.type };
  }

  const include: Prisma.UserHasQuestInclude = {};
  if (includes.quest) {
    include.quest = {
      include: includes.item ? { item: true } : undefined,
    };
  }

  return await prisma.userHasQuest.findMany({
    where: whereClause,
    include,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export async function getQuestLeaderboard({
  limit,
  fids,
  targetFid,
  mode = Mode.Classic,
}: {
  limit?: number;
  fids?: string[];
  targetFid?: string;
  mode?: Mode;
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
      mode,
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
  mode = Mode.Classic,
}: {
  fids: string[];
  targetFid: string;
  limit?: number;
  mode?: Mode;
}) {
  const fullLeaderboard = (await getQuestLeaderboard({
    fids,
    targetFid,
    mode,
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

export const getUserQuestById = async (
  fid: number,
  questId: number
): Promise<
  | (UserHasQuest & {
      quest: Quest;
    })
  | null
> => {
  const userQuest = await prisma.userHasQuest.findFirst({
    where: {
      fid,
      questId,
    },
    include: {
      quest: {
        include: {
          item: true,
        },
      },
    },
  });

  return userQuest;
};

export const createUserQuest = async (
  userQuest: Prisma.UserHasQuestCreateArgs["data"]
): Promise<UserHasQuest> => {
  const data = await prisma.userHasQuest.create({
    data: {
      ...userQuest,
      status: "incomplete",
      progress: 0,
    },
  });

  return data;
};

export const updateUserQuest = async (
  fid: number,
  questId: number,
  updates: Prisma.UserHasQuestUpdateInput,
  mode: Mode = Mode.Classic
): Promise<UserHasQuest> => {
  const data = await prisma.userHasQuest.update({
    where: {
      fid_questId_mode: {
        fid,
        questId,
        mode,
      },
    },
    data: updates,
  });

  return data;
};

export const getActiveUserQuests = async (
  fid: number,
  mode: Mode = Mode.Classic
): Promise<UserHasQuest[]> => {
  const data = await prisma.userHasQuest.findMany({
    where: {
      fid,
      mode,
      status: "incomplete",
    },
    include: {
      quest: {
        include: {
          item: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
};
