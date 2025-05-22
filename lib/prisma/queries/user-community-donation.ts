import { Prisma, UserCommunityDonation } from "@prisma/client";
import { prisma } from "../client";
import { Mode } from "@/lib/types/game";

/**
 * Get all donation records for a specific user
 * @param fid - The user's ID
 * @returns An array of donation records
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
 * @returns An array of donation records
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
 * Get Community donations by id
 * @param id - The uuid of the donation record
 * @returns The funding record
 */
export const getCommunityDonationById = async (
  id: string
): Promise<UserCommunityDonation | null> => {
  return await prisma.userCommunityDonation.findUnique({
    where: { id },
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
    _sum: { ptAmount: true },
    where: { fid },
  });
  return result._sum.ptAmount || 0;
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
  mode: Mode,
  fid?: number,
  limit: number = 10
): Promise<
  (UserCommunityDonation & {
    user: {
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      selectedAvatarUrl: string | null;
      mintedOG: boolean;
    };
  })[]
> => {
  return await prisma.userCommunityDonation.findMany({
    where: {
      mode,
      ...(fid ? { fid } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
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
  });
};

/**
 * Create a new funding record
 * @param params - The donation parameters
 * @returns The created funding record
 */
export const createUserCommunityDonation = async (params: {
  txHash: string;
  mode: Mode;
  fid: number;
  ptAmount: number;
  dollarAmount: number;
  walletAddress: string;
}): Promise<UserCommunityDonation> => {
  return await prisma.userCommunityDonation.create({
    data: {
      txHash: params.txHash,
      mode: params.mode,
      fid: params.fid,
      ptAmount: params.ptAmount,
      dollarAmount: params.dollarAmount,
      walletAddress: params.walletAddress,
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
      ptAmount: true,
    },
    orderBy: {
      _sum: {
        ptAmount: "desc",
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
    totalAmount: item._sum.ptAmount || 0,
    user: userMap.get(item.fid),
  }));
};

export type UserCommunityDonationLeaderboard = {
  fid: number;
  mode: Mode;
  latestDonationDate: Date;
  donationCount: number;
  totalPtAmount: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  selectedAvatarUrl: string | null;
  position: number;
};

export const getUserCommunityDonationsLeaderboardRaw = async (
  limit: number = 10,
  mode: Mode,
  targetFid?: number
): Promise<{
  leaderboard: UserCommunityDonationLeaderboard[];
  targetData?: UserCommunityDonationLeaderboard;
}> => {
  const query = Prisma.sql`
  WITH RankedDonations AS (
    SELECT 
      ucd."fid",
      ucd."mode",
      MAX(ucd."createdAt") AS "latestDonationDate",
      COUNT(ucd."id") AS "donationCount",
      SUM(ucd."ptAmount") AS "totalPtAmount",
      u."username",
      u."displayName",
      u."avatarUrl",
      u."selectedAvatarUrl",
      ROW_NUMBER() OVER (ORDER BY SUM(ucd."ptAmount") DESC) as position
    FROM 
      "user_community_donation" ucd
    LEFT JOIN
      "user" u ON u."fid" = ucd."fid"
    WHERE
      ucd."mode" = ${mode}
    GROUP BY 
      ucd."fid",
      ucd."mode",
      u."username",
      u."displayName",
      u."avatarUrl",
      u."selectedAvatarUrl"
  )
  SELECT * FROM RankedDonations
  WHERE
    "fid" IN (
      SELECT "fid" FROM RankedDonations 
      ORDER BY "totalPtAmount" DESC 
      LIMIT ${limit}
    )
    ${targetFid ? Prisma.sql`OR "fid" = ${targetFid}` : Prisma.empty}
  ORDER BY 
    "totalPtAmount" DESC
  `;

  const result = await prisma.$queryRaw<
    {
      fid: number;
      mode: Mode;
      latestDonationDate: Date;
      donationCount: bigint;
      totalPtAmount: number;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      selectedAvatarUrl: string | null;
      position: number;
    }[]
  >(query, mode, limit, targetFid);

  const processedResult = result.map((item) => ({
    ...item,
    donationCount: Number(item.donationCount),
    totalPtAmount: Number(item.totalPtAmount),
    position: Number(item.position),
  }));

  const targetData = targetFid
    ? processedResult.find((item) => item.fid === targetFid)
    : undefined;

  return {
    leaderboard: processedResult.slice(0, limit),
    targetData: targetData && {
      ...targetData,
      position: targetData.position,
    },
  };
};
