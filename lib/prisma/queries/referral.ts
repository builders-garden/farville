import { Referral } from "@prisma/client";
import { prisma } from "../client";

export const addReferral = async (
  referrer: number,
  referred: number
): Promise<Referral> => {
  return await prisma.referral.create({
    data: {
      fid: referrer,
      referredFid: referred,
    },
  });
};

export const getReferralsByFid = async (
  fid: number
): Promise<{
  fid: number;
  count: number;
  referredFids: number[];
}> => {
  const referrals = await prisma.referral.findMany({
    where: { fid },
    select: { referredFid: true },
  });

  return {
    fid,
    count: referrals.length,
    referredFids: referrals.map((referral) => referral.referredFid),
  };
};

export interface ReferralLeaderboardEntry {
  fid: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  selectedAvatarUrl: string | null;
  referralCount: number;
}

export async function getReferralLeaderboard(
  limit: number = 10
): Promise<ReferralLeaderboardEntry[]> {
  // Get all referrals and count them grouped by fid
  const referrals = await prisma.referral.groupBy({
    by: ["fid"],
    _count: {
      fid: true,
    },
    orderBy: {
      _count: {
        fid: "desc",
      },
    },
    take: limit,
  });

  const topReferrerFids = referrals.map((referral) => referral.fid);

  if (!topReferrerFids.length) return [];

  // Get user details for top referrers
  const users = await prisma.user.findMany({
    where: {
      fid: {
        in: topReferrerFids,
      },
    },
    select: {
      fid: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      selectedAvatarUrl: true,
    },
  });

  // Combine user data with referral counts
  const referralCounts = new Map(
    referrals.map((referral) => [referral.fid, referral._count.fid])
  );

  return users
    .map((user) => ({
      fid: user.fid,
      username: user.username ?? "",
      displayName: user.displayName ?? "",
      avatarUrl: user.avatarUrl,
      selectedAvatarUrl: user.selectedAvatarUrl,
      referralCount: referralCounts.get(user.fid) ?? 0,
    }))
    .sort((a, b) => b.referralCount - a.referralCount);
}
