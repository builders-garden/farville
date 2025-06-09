import { prisma } from "../client";

export function getClanInviteByFid(
  fid: number,
  options: {
    includeClan?: boolean;
  } = {}
) {
  const { includeClan = false } = options;

  return prisma.clanInvite.findMany({
    where: { fid },
    include: {
      clan: includeClan
        ? {
            select: {
              id: true,
              name: true,
              motto: true,
              createdAt: true,
              isPublic: true,
            },
          }
        : false,
    },
  });
}
