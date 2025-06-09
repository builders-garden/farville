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
