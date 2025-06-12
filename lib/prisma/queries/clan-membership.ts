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

export function getClanByFid(
  fid: number,
  options: {
    includeClan?: boolean;
  } = {}
) {
  return prisma.clanMembership.findFirst({
    where: { fid },
    include: options.includeClan
      ? {
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
        }
      : undefined,
  });
}

export function updateClanMembership(fid: number, role: ClanRole) {
  return prisma.clanMembership.update({
    where: { fid },
    data: { role },
  });
}
