import { prisma } from "../client";

export interface GameStats {
  totalUsers: number;
  totalReferrals: number;
  totalUsersLastWeek: number;
}

export async function getStats(): Promise<GameStats> {
  // Get total users
  const totalUsers = await prisma.user.count();

  // Get total referrals
  const totalReferrals = await prisma.referral.count();

  // Get users from last week
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const totalUsersLastWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: lastWeek,
      },
    },
  });

  return {
    totalUsers,
    totalReferrals,
    totalUsersLastWeek,
  };
}
