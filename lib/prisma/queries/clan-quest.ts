import { Prisma } from "@prisma/client";
import { prisma } from "../client";

export async function createClanQuests(
  quests: Prisma.ClanQuestCreateManyInput[]
) {
  return await prisma.clanQuest.createManyAndReturn({
    data: quests,
    skipDuplicates: true,
  });
}

export async function getClanQuests(options: { activeToday?: boolean }) {
  return await prisma.clanQuest.findMany({
    where: {
      ...(options.activeToday && {
        startAt: { lte: new Date() },
        endAt: { gte: new Date() },
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
