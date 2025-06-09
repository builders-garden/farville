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

export function deleteClanMembership(fid: number) {
  return prisma.clanMembership.delete({
    where: {
      fid,
    },
  });
}

export function getClanByFid(fid: number) {
  return prisma.clanMembership.findFirst({
    where: { fid },
    include: {
      clan: {
        select: {
          id: true,
          name: true,
          motto: true,
          createdAt: true,
          isPublic: true,
          imageUrl: true,
        },
      },
    },
  });
}
