import { QuestStatus, QuestType } from "@/lib/types/game";
import { prisma } from "../client";
import { Prisma } from "@prisma/client";

interface QuestFilters {
  category?: string;
  itemId?: number;
  type?: QuestType[];
  status?: QuestStatus;
  activeToday?: boolean;
  timeToCompare?: string;
}

interface QuestIncludes {
  quest?: boolean;
  item?: boolean;
}

export const getUserHasQuests = async (
  fid: number,
  filters: QuestFilters = {},
  includes: QuestIncludes = { quest: true }
) => {
  const timeToCompare = filters.timeToCompare || new Date().toISOString();

  const questWhere: Prisma.QuestWhereInput = {};
  const whereClause: Prisma.UserHasQuestWhereInput = {
    fid,
    quest: questWhere,
  };

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.activeToday) {
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
      include: includes.item ? { items: true } : undefined,
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
