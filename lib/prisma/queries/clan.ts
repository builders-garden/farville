import { ClanRole } from "@/lib/types/game";
import { prisma } from "../client";
import { Prisma } from "@prisma/client";
import { CLAN_MAX_MEMBERS } from "@/lib/game-constants";

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
              username: true,
              displayName: true,
              avatarUrl: true,
              selectedAvatarUrl: true,
              mintedOG: true,
            },
          }
        : false,
    },
  });
}

export function getClansLeaderboard(
  limit: number = 50,
  options?: {
    includeMembers?: boolean;
    includeLeader?: boolean;
    orderBy?: "xp" | "seasonXp" | "lastSeasonXp";
  }
) {
  return prisma.clan.findMany({
    orderBy: {
      [options?.orderBy || "xp"]: "desc",
    },
    // is this code below a good idea?
    // where: {
    //   xp: {
    //     gt: 0, // Only include clans with XP greater than 0
    //   },
    //   seasonXp: {
    //     gt: 0, // Only include clans with season XP greater than 0
    //   },
    //   lastSeasonXp: {
    //     gt: 0, // Only include clans with last season XP greater than 0
    //   },
    // },
    take: limit,
    include: {
      members: options?.includeMembers
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
      leader: options?.includeLeader
        ? {
            select: {
              fid: true,
              username: true,
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
              createdAt: true,
              itemId: true,
              fid: true,
              quantity: true,
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
              createdAt: "desc",
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
  requiredLevel?: number;
  maxMembers?: number;
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
      requiredLevel: data.requiredLevel ?? null,
      maxMembers: data.maxMembers ?? CLAN_MAX_MEMBERS,
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
    imageUrl?: string | null;
    txHash?: string;
    requiredLevel?: number | null;
    xp?: number;
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
      requiredLevel: data.requiredLevel,
      xp: data.xp,
    },
  });
}

export function incrementClanXp(clanId: string, amount: number) {
  return prisma.clan.update({
    where: { id: clanId },
    data: {
      xp: {
        increment: amount,
      },
      seasonXp: {
        increment: amount,
      },
    },
  });
}

export function deleteClan(clanId: string) {
  return prisma.clan.delete({
    where: { id: clanId },
  });
}

export async function getClansLeaderboardWithUserRank(
  userClanId: string,
  limit: number = 50,
  options?: {
    includeMembers?: boolean;
    includeLeader?: boolean;
    orderBy?: "xp" | "seasonXp" | "lastSeasonXp";
  }
) {
  // Get the top clans for the leaderboard
  const clans = await getClansLeaderboard(limit, options);

  // Get the user's clan with its rank using a safer approach
  const userClanData = await getClanById(userClanId, options);

  let userClan = null;
  if (userClanData) {
    // Calculate rank by counting clans with higher XP
    const ranksAbove = await prisma.clan.count({
      where: {
        [options?.orderBy || "xp"]: {
          gt: userClanData[options?.orderBy || "xp"],
        },
      },
    });

    userClan = {
      ...userClanData,
      rank: ranksAbove + 1,
    };
  }

  return {
    clans,
    userClan,
  };
}
