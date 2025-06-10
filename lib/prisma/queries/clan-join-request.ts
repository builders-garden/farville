import { prisma } from "../client";

export function createClanJoinRequest(clanId: string, fid: number) {
  return prisma.clanJoinRequest.create({
    data: {
      clanId,
      fid,
    },
  });
}

export function getClanJoinRequestsByClanId(clanId: string) {
  return prisma.clanJoinRequest.findMany({
    where: { clanId },
    include: {
      user: {
        select: {
          fid: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export function deleteClanJoinRequest(id: string) {
  return prisma.clanJoinRequest.delete({
    where: { id },
  });
}

export function getClanJoinRequestByUserAndClan(fid: number, clanId: string) {
  return prisma.clanJoinRequest.findFirst({
    where: {
      fid,
      clanId,
    },
  });
}
