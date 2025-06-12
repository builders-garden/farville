import { ClanRole } from "@/lib/types/game";
import { prisma } from "../client";

export function createClanMembership(
  clanId: string,
  fid: number,
  role: ClanRole = ClanRole.Member
) {
  return prisma.clanMembership.create({
    data: {
      clanId,
      fid,
      role,
    },
  });
}

export function incrementUserContributedXp(fid: number, amount: number) {
  return prisma.clanMembership.update({
    where: { fid },
    data: {
      xpContributed: {
        increment: amount,
      },
    },
  });
}

export function deleteClanMembership(fid: number) {
  return prisma.clanMembership.delete({
    where: {
      fid,
    },
  });
}

export function getClanByFid(
  fid: number,
  options: {
    includeClan?: boolean;
    includeMembers?: boolean;
  } = {}
) {
  return prisma.clanMembership.findFirst({
    where: { fid },
    include: {
      clan: options.includeClan
        ? {
            select: {
              id: true,
              name: true,
              motto: true,
              createdAt: true,
              isPublic: true,
              imageUrl: true,
              xp: true,
              members: options.includeMembers
                ? {
                    select: {
                      fid: true,
                      role: true,
                      joinedAt: true,
                      xpContributed: true,
                    },
                  }
                : false,
            },
          }
        : false,
    },
  });
}

export function updateClanMembership(fid: number, role: ClanRole) {
  return prisma.clanMembership.update({
    where: { fid },
    data: { role },
  });
}
