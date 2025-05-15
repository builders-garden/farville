import { UserCommunityBoosterHistory, Prisma } from "@prisma/client";
import { prisma } from "../client";

/**
 * Get the user's community booster history, ordered by createdAt desc
 * @param limit Optional limit for number of rows
 */
export const getUserCommunityBoosterHistory = async (
  limit?: number
): Promise<UserCommunityBoosterHistory[]> => {
  return prisma.userCommunityBoosterHistory.findMany({
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
};

/**
 * Get the latest (current) community booster entry
 */
export const getCurrentCommunityBooster =
  async (): Promise<UserCommunityBoosterHistory | null> => {
    return prisma.userCommunityBoosterHistory.findFirst({
      orderBy: { createdAt: "desc" },
    });
  };

/**
 * Create a new community booster entry
 * @param data - Prisma.UserCommunityBoosterHistoryCreateInput
 */
export const createCommunityBoosterEntry = async (
  data: Prisma.UserCommunityBoosterHistoryCreateInput
): Promise<UserCommunityBoosterHistory> => {
  return prisma.userCommunityBoosterHistory.create({
    data,
  });
};
