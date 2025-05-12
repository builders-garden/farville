import { UserCommunityDonation } from "@prisma/client";
import { prisma } from "../client";
import { Mode } from "@/lib/types/game";

/**
 * Get all funding records for a specific user
 * @param fid - The user's ID
 * @returns An array of funding records
 */
export const getCommunityDonationsByFid = async (
  fid: number
): Promise<UserCommunityDonation[]> => {
  return await prisma.userCommunityDonation.findMany({
    where: { fid },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get the user community donations by mode
 * @param mode - The game mode
 * @returns An array of funding records
 */
export const getCommunityDonationsByMode = async (
  mode: Mode
): Promise<UserCommunityDonation[]> => {
  return await prisma.userCommunityDonation.findMany({
    where: { mode },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get Community donations by txHash
 * @param txHash - The transaction hash
 * @returns The funding record
 */
export const getCommunityDonationByTxHash = async (
  txHash: string
): Promise<UserCommunityDonation | null> => {
  return await prisma.userCommunityDonation.findUnique({
    where: { txHash },
  });
};

/**
 * Get the total funding amount for a specific user
 * @param fid - The user's ID
 * @returns The total funding amount
 */
export const getTotalDonationAmountByFid = async (
  fid: number
): Promise<number> => {
  const result = await prisma.userCommunityDonation.aggregate({
    _sum: { amount: true },
    where: { fid },
  });
  return result._sum.amount || 0;
};

/**
 * Get funding records created within a specific date range
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @returns An array of funding records
 */
export const getUserCommunityDonationsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<UserCommunityDonation[]> => {
  return await prisma.userCommunityDonation.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get the last funding records
 * @param limit - The number of records to retrieve
 * @returns An array of funding records
 */
export const getLastUserCommunityDonations = async (
  limit: number
): Promise<UserCommunityDonation[]> => {
  return await prisma.userCommunityDonation.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

/**
 * Create a new funding record
 * @param fid - The user's ID
 * @param amount - The funding amount
 * @returns The created funding record
 */
export const createUserCommunityDonation = async (
  txHash: string,
  mode: Mode,
  fid: number,
  amount: number
): Promise<UserCommunityDonation> => {
  return await prisma.userCommunityDonation.create({
    data: {
      txHash,
      mode,
      fid,
      amount,
    },
  });
};

/**
 * Get the donation leaderboard with the number of donations and total amount donated
 * @param limit - The number of records to retrieve
 * @returns An array of objects containing the user's ID, number of donations, total amount donated, and user data
 */
export const getDonationLeaderboard = async (
  limit: number
): Promise<
  {
    fid: number;
    donationCount: number;
    totalAmount: number;
    user:
      | {
          fid: number;
          username: string;
          displayName: string | null;
          avatarUrl: string | null;
          selectedAvatarUrl: string | null;
        }
      | undefined;
  }[]
> => {
  const result = await prisma.userCommunityDonation.groupBy({
    by: ["fid"],
    _count: {
      fid: true,
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
    take: limit,
  });

  // Get all unique fids
  const fids = result.map((item) => item.fid);

  // Fetch users in a single query
  const users = await prisma.user.findMany({
    where: { fid: { in: fids } },
    select: {
      fid: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      selectedAvatarUrl: true,
    },
  });

  // Create a map for quick user lookup
  const userMap = new Map(users.map((user) => [user.fid, user]));

  return result.map((item) => ({
    fid: item.fid,
    donationCount: item._count.fid,
    totalAmount: item._sum.amount || 0,
    user: userMap.get(item.fid),
  }));
};

export const getUserCommunityDonationsLeaderboardRaw = async (
  limit: number = 10
): Promise<
  {
    fid: number;
    donationCount: number;
    totalAmount: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    selectedAvatarUrl: string | null;
  }[]
> => {
  const result = await prisma.$queryRaw<
    {
      fid: number;
      donationCount: bigint;
      totalAmount: number;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      selectedAvatarUrl: string | null;
    }[]
  >`
  SELECT 
    ucd."fid",
    COUNT(ucd."fid") AS "donationCount",
    SUM(ucd."amount") AS "totalAmount",
    u."username",
    u."displayName",
    u."avatarUrl",
    u."selectedAvatarUrl"
  FROM 
    "user_community_donation" ucd
  LEFT JOIN
    "user" u ON u."fid" = ucd."fid"
  GROUP BY 
    ucd."fid",
    u."username",
    u."displayName",
    u."avatarUrl",
    u."selectedAvatarUrl"
  ORDER BY 
    SUM(ucd."amount") DESC
  LIMIT 
    ${limit};
  `;
  return result.map((item) => ({
    ...item,
    donationCount: Number(item.donationCount),
  }));
};
