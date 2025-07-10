import { QuestStatus } from "@/lib/types/game";
import { prisma } from "../client";
import { ClanHasQuest, ClanQuest, Item, Prisma } from "@prisma/client";

export function getClanQuestsByClanId(options: {
  clanId: string;
  active?: boolean;
  status?: string;
}) {
  const { clanId, active = true, status } = options;

  const filters = {
    clanId,
    ...(active && {
      quest: {
        AND: [
          {
            startAt: {
              lte: new Date(),
            },
          },
          {
            endAt: {
              gte: new Date(),
            },
          },
        ],
      },
    }),
    ...(status && { status }),
  };

  return prisma.clanHasQuest.findMany({
    where: filters,
    orderBy: [
      {
        quest: {
          id: "asc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      quest: {
        include: {
          item: true,
        },
      },
    },
  });
}

export async function getClanQuestById(
  clanId: string,
  questId: string,
  options: {
    includeQuest?: boolean;
  }
): Promise<
  | (ClanHasQuest & {
      quest?: ClanQuest & {
        item: Item;
      };
    })
  | null
> {
  return prisma.clanHasQuest.findUnique({
    where: {
      clanId_questId: {
        clanId,
        questId,
      },
    },
    include: options.includeQuest
      ? {
          quest: {
            include: {
              item: true,
            },
          },
        }
      : undefined,
  });
}

export function updateClanQuest(data: {
  clanId: string;
  questId: string;
  progress?: number;
  status?: QuestStatus;
  completedAt?: Date;
}) {
  return prisma.clanHasQuest.update({
    where: {
      clanId_questId: {
        clanId: data.clanId,
        questId: data.questId,
      },
    },
    data: {
      progress: data.progress,
      status: data.status,
      completedAt: data.completedAt,
    },
  });
}

export function incrementClanQuestProgress(data: {
  clanId: string;
  questId: string;
  amount: number;
  status?: QuestStatus;
  completedAt?: Date;
}) {
  const updateData: Prisma.ClanHasQuestUpdateInput = {
    progress: {
      increment: data.amount,
    },
  };

  // Only include status and completedAt if they are provided
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.completedAt !== undefined) {
    updateData.completedAt = data.completedAt;
  }

  return prisma.clanHasQuest.update({
    where: {
      clanId_questId: {
        clanId: data.clanId,
        questId: data.questId,
      },
    },
    data: updateData,
  });
}

export function createClanHasQuests(
  data: Prisma.ClanHasQuestCreateManyInput[]
) {
  return prisma.clanHasQuest.createMany({
    data,
    skipDuplicates: true,
  });
}
