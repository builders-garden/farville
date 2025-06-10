import { ClanRole } from "@/lib/types/game";
import { prisma } from "../client";
import { Prisma } from "@prisma/client";

export function getClans(filters?: {
  strToSearch?: string;
  isPublic?: boolean;
  includeMembers?: boolean;
  includeLeader?: boolean;
}) {
  const {
    strToSearch = "",
    isPublic,
    includeMembers = false,
    includeLeader: includeClanLeader = false,
  } = filters || {};

  return prisma.clan.findMany({
    where: {
      ...(strToSearch !== ""
        ? {
            name: {
              contains: strToSearch,
              mode: "insensitive",
            },
          }
        : {}),
      isPublic,
    },
    include: {
      members: includeMembers
        ? {
            select: {
              fid: true,
              role: true,
              joinedAt: true,
              xpContributed: true,
            },
          }
        : false,
      leader: includeClanLeader
        ? {
            select: {
              fid: true,
            },
          }
        : false,
    },
  });
}

export function getClanById(
  clanId: string,
  options?: {
    includeMembers?: boolean;
    includeLeader?: boolean;
    includeRequests?: boolean;
    includeJoinRequests?: boolean;
  }
) {
  const {
    includeMembers = false,
    includeLeader: includeClanLeader = false,
    includeRequests = false,
    includeJoinRequests = false,
  } = options || {};

  return prisma.clan.findUnique({
    where: { id: clanId },
    include: {
      members: includeMembers
        ? {
            select: {
              fid: true,
              role: true,
              joinedAt: true,
              xpContributed: true,
              user: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  selectedAvatarUrl: true,
                  mintedOG: true,
                },
              },
            },
            orderBy: {
              xpContributed: "desc",
            },
          }
        : false,
      leader: includeClanLeader
        ? {
            select: {
              fid: true,
              username: true,
            },
          }
        : false,
      requests: includeRequests
        ? {
            select: {
              requestId: true,
              request: {
                select: {
                  fid: true,
                  itemId: true,
                  quantity: true,
                  filledQuantity: true,
                  createdAt: true,
                  item: {
                    select: {
                      id: true,
                      name: true,
                      icon: true,
                      slug: true,
                      category: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              request: {
                createdAt: "desc",
              },
            },
          }
        : false,
      joinRequests: includeJoinRequests
        ? {
            select: {
              fid: true,
              user: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  selectedAvatarUrl: true,
                  mintedOG: true,
                },
              },
              createdAt: true,
            },
          }
        : false,
    },
  });
}

export function createClan(data: {
  name: string;
  createdBy: number;
  leaderFid?: number;
  motto?: string;
  isPublic?: boolean;
  imageUrl?: string;
  txHash?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const clanData: Prisma.ClanUncheckedCreateInput = {
      name: data.name,
      leaderFid: data.leaderFid ?? data.createdBy,
      createdBy: data.createdBy,
      motto: data.motto ?? "",
      isPublic: data.isPublic ?? true,
      imageUrl: data.imageUrl ?? "",
      txHash: data.txHash ?? "",
    };

    const clan = await tx.clan.create({
      data: clanData,
    });

    // Add the creator as a clan leader
    await tx.clanMembership.create({
      data: {
        clanId: clan.id,
        fid: data.createdBy,
        role: ClanRole.Leader,
      },
    });

    // Delete all pending join requests from the creator
    await tx.clanJoinRequest.deleteMany({
      where: {
        fid: data.createdBy,
      },
    });

    return clan;
  });
}

export function updateClan(
  clanId: string,
  data: {
    name?: string;
    motto?: string;
    isPublic?: boolean;
    imageUrl?: string;
    txHash?: string;
  }
) {
  return prisma.clan.update({
    where: { id: clanId },
    data: {
      name: data.name,
      motto: data.motto,
      isPublic: data.isPublic,
      imageUrl: data.imageUrl,
      txHash: data.txHash,
    },
  });
}
