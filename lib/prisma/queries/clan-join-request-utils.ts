import { prisma } from "../client";
import { ClanJoinRequestWithClan } from "../types";

export function getOutgoingClanJoinRequestsByFid(
  fid: number
): Promise<ClanJoinRequestWithClan[]> {
  return prisma.clanJoinRequest.findMany({
    where: {
      fid,
    },
    include: {
      clan: {
        select: {
          id: true,
          name: true,
          motto: true,
          imageUrl: true,
          isPublic: true,
        },
      },
    },
  });
}

export function getClanJoinRequestById(requestId: string) {
  return prisma.clanJoinRequest.findUnique({
    where: {
      id: requestId,
    },
  });
}

export function deleteClanJoinRequestById(requestId: string) {
  return prisma.clanJoinRequest.delete({
    where: {
      id: requestId,
    },
  });
}

/**
 * Deletes all clan join requests for a specific user
 * Used when a user successfully joins a clan or when their request is accepted
 */
export function deleteAllClanJoinRequestsByFid(fid: number) {
  return prisma.clanJoinRequest.deleteMany({
    where: {
      fid,
    },
  });
}
