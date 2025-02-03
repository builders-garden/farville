import { prisma } from "./client";
import { LEVEL_XP_THRESHOLDS, LEVEL_REWARDS } from "@/lib/game-constants";
import { DbUser } from "@/supabase/types";

export async function getQuestLeaderboard({
  limit,
  fids,
  targetFid,
}: {
  limit?: number;
  fids?: string[];
  targetFid?: string;
}) {
  // If no specific fids provided and targetFid exists, we need full leaderboard data
  const needsFullLeaderboard = !fids && targetFid;

  // Get quests grouped by fid, ordered by count, excluding incomplete
  const groupedQuests = await prisma.userHasQuest.groupBy({
    by: ["fid"],
    _count: {
      fid: true,
    },
    where: {
      status: {
        not: "incomplete",
      },
      ...(fids ? { fid: { in: fids.map(Number) } } : {}),
    },
    orderBy: {
      _count: {
        fid: "desc",
      },
    },
    // Only apply limit if we don't need full leaderboard for position calculation
    ...(!needsFullLeaderboard && limit ? { take: limit } : {}),
  });

  // Get the fids from grouped quests
  const userFids = groupedQuests.map((quest) => quest.fid);

  // Fetch users data for these fids
  const users = await prisma.user.findMany({
    where: {
      fid: {
        in: userFids,
      },
    },
    select: {
      fid: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  });

  // Combine quest counts with user data and sort
  const leaderboard = users
    .map((user) => ({
      ...user,
      questCount:
        groupedQuests.find((quest) => quest.fid === user.fid)?._count.fid || 0,
    }))
    .sort((a, b) => b.questCount - a.questCount);

  // If we need target position, find it in the full leaderboard
  if (needsFullLeaderboard) {
    const targetPosition = leaderboard.findIndex(
      (user) => user.fid === Number(targetFid)
    );

    // Return limited leaderboard with target position
    return {
      users: leaderboard.slice(0, limit),
      targetPosition: targetPosition !== -1 ? targetPosition + 1 : null,
      questCount: leaderboard.find((user) => user.fid === Number(targetFid))
        ?.questCount,
    };
  }

  // Return just the leaderboard if no position needed
  return leaderboard;
}

export const addUserItem = async (
  fid: number,
  itemId: number,
  quantity: number
) => {
  return await prisma.userHasItem.upsert({
    where: {
      userFid_itemId: {
        userFid: fid,
        itemId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userFid: fid,
      itemId,
      quantity,
    },
  });
};

export const removeUserItem = async (
  fid: number,
  itemId: number,
  quantity: number
) => {
  // Use a transaction to prevent race conditions
  return await prisma.$transaction(async (tx) => {
    // Get current quantity with a lock
    const currentItem = await tx.userHasItem.findUnique({
      where: {
        userFid_itemId: {
          userFid: fid,
          itemId,
        },
      },
    });

    if (!currentItem) return;

    // Calculate new quantity, ensuring it doesn't go below 0
    const newQuantity = Math.max(0, currentItem.quantity - quantity);

    if (newQuantity === 0) {
      // Delete the record if quantity would be 0
      return await tx.userHasItem.delete({
        where: {
          userFid_itemId: {
            userFid: fid,
            itemId,
          },
        },
      });
    }

    // Update with new quantity
    return await tx.userHasItem.update({
      where: {
        userFid_itemId: {
          userFid: fid,
          itemId,
        },
      },
      data: {
        quantity: newQuantity,
      },
    });
  });
};

export const updateUserXP = async (
  fid: number,
  xp: number
): Promise<{
  user: DbUser
  didLevelUp: boolean;
  newXP: number;
  newLevel: number;
}> => {
  return await prisma.$transaction(async (tx) => {
    // Get current user data with a lock
    const currentUser = await tx.user.findUnique({
      where: { fid },
      select: { xp: true, coins: true },
    });

    if (!currentUser) throw new Error("User not found");

    const currentXP = currentUser.xp;
    const newXP = currentXP + xp;

    const currentLevel = LEVEL_XP_THRESHOLDS.findIndex(
      (threshold) => currentXP < threshold
    );
    const newLevel = LEVEL_XP_THRESHOLDS.findIndex(
      (threshold) => newXP < threshold
    );
    const didLevelUp = newLevel > currentLevel;

    // Update user XP and potentially coins if leveled up
    const user = await tx.user.update({
      where: { fid },
      data: {
        xp: { increment: xp },
        ...(didLevelUp && {
          coins: { increment: LEVEL_REWARDS[newLevel - 1].coins },
        }),
      },
    });

    return {
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
      didLevelUp,
      newXP,
      newLevel,
    };
  });
};

export const updateUserCoins = async (fid: number, coins: number) => {
  return await prisma.user.update({
    where: { fid },
    data: { coins: { increment: coins } },
  });
};
