import { prisma } from "../client";

export function getClanQuests(options: {
  clanId: string;
  active?: boolean;
  status?: string;
}) {
  const { clanId, active = true, status } = options;

  const filters = {
    clanId,
    ...(active && {
      AND: [
        {
          status: {
            not: "completed",
          },
        },
        {
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
        },
      ],
    }),
    ...(status && { status }),
  };

  return prisma.clanHasQuest.findMany({
    where: filters,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      quest: {
        include: {
          item: true,
        },
      },
    },
  });
}
