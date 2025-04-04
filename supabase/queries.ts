import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { supabase } from "./client";
import {
  DbItem,
  DbUser,
  DbUserHasItem,
  InsertDbUser,
  DbGridCell,
  DbUserNotification,
  InsertDbUserNotification,
  DbRequest,
  InsertDbRequest,
  DbQuest,
  InsertDbQuest,
  DbQuestWithItem,
  DbUserHasQuest,
  DbUserHasQuestWithQuest,
  InsertDbUserHasQuest,
  DbUserHasQuestStatus,
  DbUserHarvestedCrop,
  DbCollectible,
  DbUserHasCollectible,
  DbUserHasCollectibleStatus,
} from "./types";
import { CROP_DATA, SPEED_BOOST } from "@/lib/game-constants";
import { CropType, PerkType, QuestStatus } from "@/types/game";
import { getBoostTime, getCurrentLevelAndProgress } from "@/lib/utils";
import {
  generateDailyQuests,
  generateMonthlyQuests,
  generateWeeklyQuests,
} from "./quests";
import { prisma } from "@/lib/prisma/client";

export const getUsers = async (
  offset: number = 0,
  limit: number = 100
): Promise<DbUser[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .range(offset, offset + limit);
  if (error) throw error;
  return data;
};

export const getGridCellsBulk = async (
  offset: number = 0,
  limit: number = 100
): Promise<DbGridCell[]> => {
  const { data, error } = await supabase
    .from("user_grid_cells")
    .select("*")
    .range(offset, offset + limit);
  if (error) throw error;
  return data;
};

// Items queries
export const getItems = async (category?: string): Promise<DbItem[]> => {
  const query = supabase.from("items").select("*");

  if (category) {
    query.eq("category", category);
  }

  query.order("requiredLevel", { ascending: true });
  query.order("buyPrice", { ascending: true });
  query.order("sellPrice", { ascending: true });

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getItemById = async (itemId: number): Promise<DbItem | null> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getItemsByCategory = async (
  category: string
): Promise<DbItem[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("category", category)
    .order("requiredLevel", { ascending: true });

  if (error) throw error;
  return data;
};

// Users queries
export const getUser = async (fid: number): Promise<DbUser | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("fid", fid)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createUser = async (user: InsertDbUser): Promise<DbUser> => {
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUser = async (
  fid: number,
  updates: Partial<DbUser>
): Promise<DbUser> => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("fid", fid)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserCoins = async (
  fid: number,
  coins: number
): Promise<DbUser> => {
  const { data, error } = await supabase
    .from("users")
    .update({ coins })
    .eq("fid", fid)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUsersByXp = async (
  limit?: number,
  targetFid?: number
): Promise<{
  users: DbUser[];
  targetPosition?: number;
}> => {
  const query = supabase
    .from("users")
    .select("*")
    .order("xp", { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;

  let targetPosition: number | undefined;
  if (targetFid) {
    // Get target user's XP
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("xp")
      .eq("fid", targetFid)
      .single();

    if (targetError) throw targetError;

    // Count users with higher or equal XP to get position
    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("xp", targetUser.xp);

    if (countError) throw countError;
    targetPosition = count || 0;
  }

  return {
    users: data,
    targetPosition,
  };
};

export const getItemBySlug = async (slug: string): Promise<DbItem | null> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getUserItemByItemId = async (
  userFid: number,
  itemId: number
): Promise<(DbUserHasItem & { item: DbItem }) | null> => {
  const { data, error } = await supabase
    .from("user_has_items")
    .select("*, item:items(*)")
    .eq("userFid", userFid)
    .eq("itemId", itemId)
    .gte("quantity", 1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// User Items queries
export const getUserItems = async (
  userFid: number,
  category?: string
): Promise<DbUserHasItem[]> => {
  const query = supabase
    .from("user_has_items")
    .select(
      `
      *,
      item:items (*)
    `
    )
    .eq("userFid", userFid);

  if (category) {
    query.eq("items.category", category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const updateUserItem = async (
  userFid: number,
  itemId: number,
  quantity: number
): Promise<DbUserHasItem> => {
  const { data, error } = await supabase
    .from("user_has_items")
    .upsert({
      userFid,
      itemId,
      quantity,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addUserItem = async (
  userFid: number,
  itemId: number,
  quantity: number
): Promise<DbUserHasItem> => {
  const { data: existing } = await supabase
    .from("user_has_items")
    .select("*")
    .eq("userFid", userFid)
    .eq("itemId", itemId)
    .single();

  const { data, error } = await supabase
    .from("user_has_items")
    .upsert(
      {
        userFid,
        itemId,
        quantity: existing ? existing.quantity + quantity : quantity,
      },
      {
        onConflict: "userFid,itemId",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeUserItem = async (
  userFid: number,
  itemId: number,
  quantity: number
): Promise<void> => {
  const { data: existing } = await supabase
    .from("user_has_items")
    .select("*")
    .eq("userFid", userFid)
    .eq("itemId", itemId)
    .maybeSingle();

  if (!existing) return;

  if (existing.quantity <= quantity) {
    const { error } = await supabase
      .from("user_has_items")
      .delete()
      .eq("userFid", userFid)
      .eq("itemId", itemId);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_has_items")
      .update({ quantity: existing.quantity - quantity })
      .eq("userFid", userFid)
      .eq("itemId", itemId);

    if (error) throw error;
  }
};

export const giftStarterPack = async (userFid: number) => {
  await addUserItem(userFid, 1, 4);
  await addUserItem(userFid, 9, 4);
};

// Notifications queries
export const getUserNotificationDetails = async (
  fid: number
): Promise<FrameNotificationDetails | undefined> => {
  const { data, error } = await supabase
    .from("users")
    .select("notificationDetails")
    .eq("fid", fid)
    .single();

  if (error) throw error;
  return data?.notificationDetails
    ? JSON.parse(data.notificationDetails)
    : undefined;
};

export const setUserNotificationDetails = async (
  fid: number,
  details: FrameNotificationDetails
): Promise<void> => {
  await supabase
    .from("users")
    .update({ notificationDetails: JSON.stringify(details) })
    .eq("fid", fid);
};

export const deleteUserNotificationDetails = async (
  fid: number
): Promise<void> => {
  await supabase
    .from("users")
    .update({ notificationDetails: null })
    .eq("fid", fid);
};

export const addReferral = async (
  referrer: number,
  referred: number
): Promise<void> => {
  await supabase.from("referrals").insert({
    fid: referrer,
    referredFid: referred,
  });
};

export const getReferralsByFid = async (
  fid: number
): Promise<{
  fid: number;
  count: number;
  referredFids: number[];
}> => {
  const { data, error } = await supabase
    .from("referrals")
    .select()
    .eq("fid", fid);

  if (error) throw error;
  return {
    fid,
    count: data.length,
    referredFids: data.map((referral) => referral.referredFid),
  };
};

export interface ReferralLeaderboardEntry {
  fid: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  referralCount: number;
  xp: number;
}

export async function getReferralLeaderboard(
  limit: number = 10
): Promise<ReferralLeaderboardEntry[]> {
  // Get all referrals
  const { data: referrals, error: referralsError } = await supabase
    .from("referrals")
    .select("fid");

  if (referralsError) throw referralsError;
  if (!referrals.length) return [];

  // Count referrals per fid and get top referrers
  const referralCounts = referrals.reduce((acc, { fid }) => {
    acc.set(fid, (acc.get(fid) || 0) + 1);
    return acc;
  }, new Map<number, number>());

  const topReferrerFids = Array.from(referralCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([fid]) => fid);

  // Get user details for top referrers
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("fid, username, displayName, avatarUrl, xp")
    .in("fid", topReferrerFids);

  if (usersError) throw usersError;

  // Combine user data with referral counts
  return users
    .map((user) => ({
      fid: user.fid,
      username: user.username ?? "",
      displayName: user.displayName ?? "",
      avatarUrl: user.avatarUrl,
      referralCount: referralCounts.get(user.fid) ?? 0,
      xp: user.xp,
    }))
    .sort((a, b) => b.referralCount - a.referralCount);
}

export interface GameStats {
  totalUsers: number;
  totalReferrals: number;
  totalUsersLastWeek: number;
}

export async function getStats(): Promise<GameStats> {
  // Get total users
  const { count: totalUsers, error: usersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (usersError) throw usersError;

  // Get total referrals
  const { count: totalReferrals, error: referralsError } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true });

  if (referralsError) throw referralsError;

  // Get users from last week
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekISO = lastWeek.toISOString();

  const { count: totalUsersLastWeek, error: recentUsersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("createdAt", lastWeekISO);

  if (recentUsersError) throw recentUsersError;

  return {
    totalUsers: totalUsers || 0,
    totalReferrals: totalReferrals || 0,
    totalUsersLastWeek: totalUsersLastWeek || 0,
  };
}

// Farm plot queries
export const getGridCells = async (fid: number): Promise<DbGridCell[]> => {
  const { data, error } = await supabase
    .from("user_grid_cells")
    .select("*")
    .eq("fid", fid)
    .order("x", { ascending: true })
    .order("y", { ascending: true });

  if (error) throw error;
  return data;
};

export const plantGridCell = async (
  fid: number,
  x: number,
  y: number,
  cropType: string
): Promise<void> => {
  const plantedAt = new Date();
  const growthTime = CROP_DATA[cropType].growthTime;
  const harvestAt = new Date(plantedAt.getTime() + growthTime);
  const { error } = await supabase
    .from("user_grid_cells")
    .update({
      cropType: cropType,
      plantedAt: plantedAt.toISOString(),
      harvestAt: harvestAt.toISOString(),
    })
    .eq("fid", fid)
    .eq("x", x)
    .eq("y", y)
    .select()
    .single();

  if (error) throw error;
};

export const harvestGridCell = async (
  fid: number,
  x: number,
  y: number
): Promise<void> => {
  const { error } = await supabase
    .from("user_grid_cells")
    .update({
      cropType: null,
      plantedAt: null,
      isReadyToHarvest: false,
      harvestAt: null,
      speedBoostedAt: null,
    })
    .eq("fid", fid)
    .eq("x", x)
    .eq("y", y);
  if (error) throw error;
};

export const fertilizeGridCell = async (
  fid: number,
  x: number,
  y: number
): Promise<void> => {
  const { error } = await supabase
    .from("user_grid_cells")
    .update({ isReadyToHarvest: true, harvestAt: new Date().toISOString() })
    .eq("fid", fid)
    .eq("x", x)
    .eq("y", y)
    .select()
    .single();

  if (error) throw error;
};

export const speedBoostGridCell = async (
  fid: number,
  x: number,
  y: number,
  boostSlug: PerkType,
  harvestAt: Date
): Promise<DbGridCell | null> => {
  const currentHarvestTime = new Date(harvestAt);
  const boostTime = getBoostTime(boostSlug);

  // Get current cell to check speedBoostedAt
  const { data: currentCell } = await supabase
    .from("user_grid_cells")
    .select("speedBoostedAt")
    .eq("fid", fid)
    .eq("x", x)
    .eq("y", y)
    .single();

  // Check if enough time has passed since last speed boost
  if (currentCell?.speedBoostedAt) {
    const lastBoostTime = new Date(currentCell.speedBoostedAt);
    const timeSinceBoost = Date.now() - lastBoostTime.getTime();
    if (timeSinceBoost < SPEED_BOOST[boostSlug].duration) {
      throw new Error(
        "Cannot speed boost yet - must wait for boost duration to expire"
      );
    }
  }

  const { data, error } = await supabase
    .from("user_grid_cells")
    .update({
      harvestAt: new Date(
        currentHarvestTime.getTime() - boostTime
      ).toISOString(),
      speedBoostedAt: new Date().toISOString(),
    })
    .eq("fid", fid)
    .eq("x", x)
    .eq("y", y)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getGridCell = async (
  fid: number,
  x: number,
  y: number
): Promise<DbGridCell | null> => {
  const { data, error } = await supabase
    .from("user_grid_cells")
    .select("*")
    .eq("fid", fid)
    .eq("x", x)
    .eq("y", y)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createGridCell = async (
  fid: number,
  x: number,
  y: number
): Promise<void> => {
  await supabase.from("user_grid_cells").upsert(
    {
      fid,
      x,
      y,
    },
    {
      onConflict: "fid,x,y",
    }
  );
};

export const initializeGrid = async (fid: number): Promise<void> => {
  const initialSize = {
    width: 2,
    height: 2,
  };

  // Create a grid of cells based on the initial size
  const cells = [];
  for (let x = 1; x <= initialSize.width; x++) {
    for (let y = 1; y <= initialSize.height; y++) {
      cells.push({
        fid,
        x,
        y,
      });
    }
  }

  // Insert all cells at once
  const { error } = await supabase.from("user_grid_cells").upsert(cells, {
    onConflict: "fid,x,y",
  });

  if (error) throw error;
};

// User Notification queries
export const createUserNotification = async (
  notification: InsertDbUserNotification
): Promise<DbUserNotification> => {
  const { data, error } = await supabase
    .from("user_notification")
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserNotificationById = async (
  id: string
): Promise<DbUserNotification | null> => {
  const { data, error } = await supabase
    .from("user_notification")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateUserNotification = async (
  id: string,
  updates: Partial<Omit<DbUserNotification, "id" | "created_at">>
): Promise<DbUserNotification> => {
  const { data, error } = await supabase
    .from("user_notification")
    .update({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUserNotification = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("user_notification")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const getUserNotifications = async (
  fid: number,
  limit?: number
): Promise<DbUserNotification[]> => {
  const query = supabase
    .from("user_notification")
    .select("*")
    .eq("fid", fid)
    .order("created_at", { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getUserNotificationsByCategory = async (
  fid: number,
  category: string,
  limit?: number,
  dates: {
    createdBefore?: Date;
    createdAfter?: Date;
  } = {}
): Promise<DbUserNotification[]> => {
  const query = supabase
    .from("user_notification")
    .select("*")
    .eq("fid", fid)
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (dates.createdBefore) {
    query.lte("created_at", dates.createdBefore.toISOString());
  }

  if (dates.createdAfter) {
    query.gte("created_at", dates.createdAfter.toISOString());
  }

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// Request queries
export const createRequest = async (
  request: InsertDbRequest
): Promise<DbRequest> => {
  const { data, error } = await supabase
    .from("requests")
    .insert({ ...request, filledQuantity: 0 })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRequestById = async (
  id: number
): Promise<(DbRequest & { item: DbItem; user: DbUser }) | null> => {
  const { data, error } = await supabase
    .from("requests")
    .select("*, item:items (*), user:users (*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getUserRequests = async (
  fid: number
): Promise<(DbRequest & { item: DbItem })[]> => {
  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      *,
      item:items (*)
    `
    )
    .eq("fid", fid)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllRequests = async (): Promise<
  (DbRequest & { item: DbItem; user: DbUser })[]
> => {
  const { data, error } = await supabase
    .from("requests")
    .select(
      `
      *,
      item:items (*),
      user:users (*)
    `
    )
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data;
};

export const incrementRequestFilledQuantity = async (
  id: number,
  amount: number = 1
): Promise<DbRequest> => {
  // First fetch the current request
  const { data: request } = await supabase
    .from("requests")
    .select("quantity, filledQuantity")
    .eq("id", id)
    .single();

  if (!request) throw new Error("Request not found");

  // Calculate remaining quantity and adjust amount if needed
  const remainingQuantity = request.quantity - request.filledQuantity;
  const adjustedAmount = Math.min(amount, remainingQuantity);

  // Then update with the new total
  const { data, error } = await supabase
    .from("requests")
    .update({ filledQuantity: request.filledQuantity + adjustedAmount })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteRequest = async (id: number): Promise<void> => {
  const { error } = await supabase.from("requests").delete().eq("id", id);

  if (error) throw error;
};

// Quest queries
export const getQuests = async (): Promise<DbQuestWithItem[]> => {
  const { data, error } = await supabase
    .from("quests")
    .select(
      `
      *,
      items (
        *)
      `
    )
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data;
};

export const getActiveQuests = async (): Promise<DbQuestWithItem[]> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("quests")
    .select(
      `
      *,
      items (
        *)
      `
    )
    .lte("startAt", now)
    .gt("endAt", now)
    .order("endAt", { ascending: true });

  if (error) throw error;
  return data;
};

export const getQuestById = async (id: number): Promise<DbQuest | null> => {
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createQuest = async (quest: InsertDbQuest): Promise<DbQuest> => {
  const { data, error } = await supabase
    .from("quests")
    .insert(quest)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createQuests = async (
  quests: InsertDbQuest[]
): Promise<DbQuest[]> => {
  const { data, error } = await supabase.from("quests").insert(quests).select();

  if (error) throw error;
  return data;
};

export const updateQuest = async (
  id: number,
  updates: Partial<InsertDbQuest>
): Promise<DbQuest> => {
  const { data, error } = await supabase
    .from("quests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteQuest = async (id: number): Promise<void> => {
  const { error } = await supabase.from("quests").delete().eq("id", id);

  if (error) throw error;
};

// User Quests queries
// export const getUserQuests = async (
//   fid: number
// ): Promise<DbUserHasQuestWithQuest[]> => {
//   const { data, error } = await supabase
//     .from("user_has_quests")
//     .select(
//       `
//       *,
//       quest:quests (
//         *,
//         items (*)
//       )
//     `
//     )
//     .eq("fid", fid)
//     .order("createdAt", { ascending: false });

//   if (error) throw error;
//   return data;
// };

export const getUserQuestById = async (
  fid: number,
  questId: number
): Promise<DbUserHasQuestWithQuest | null> => {
  const { data, error } = await supabase
    .from("user_has_quests")
    .select(
      `
      *,
      quest:quests (
        *,
        items (*)
      )
    `
    )
    .eq("fid", fid)
    .eq("questId", questId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createUserQuest = async (
  userQuest: InsertDbUserHasQuest
): Promise<DbUserHasQuest> => {
  const { data, error } = await supabase
    .from("user_has_quests")
    .insert({ ...userQuest, status: "incomplete", progress: 0 })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserQuest = async (
  fid: number,
  questId: number,
  updates: Partial<DbUserHasQuest>
): Promise<DbUserHasQuest> => {
  const { data, error } = await supabase
    .from("user_has_quests")
    .update(updates)
    .eq("fid", fid)
    .eq("questId", questId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getActiveUserQuests = async (
  fid: number
): Promise<DbUserHasQuestWithQuest[]> => {
  const { data, error } = await supabase
    .from("user_has_quests")
    .select(
      `
      *,
      quest:quests (
        *,
        items (*)
      )
    `
    )
    .eq("fid", fid)
    .eq("status", "incomplete")
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data;
};

export const getQuestsByItemId = async (
  itemId: number,
  active: boolean = true
): Promise<DbQuestWithItem[]> => {
  const query = supabase
    .from("quests")
    .select(
      `
      *,
      items (*)
    `
    )
    .eq("itemId", itemId);

  if (active) {
    const now = new Date().toISOString();
    query.lte("startAt", now).gt("endAt", now);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getUserQuests = async (
  fid: number,
  filter?: {
    category?: string;
    itemId?: number;
    type?: ("daily" | "weekly" | "monthly")[];
    status?: DbUserHasQuestStatus;
    activeToday?: boolean;
    timeToCompare?: string;
  }
): Promise<DbUserHasQuestWithQuest[]> => {
  const query = supabase
    .from("user_has_quests")
    .select(
      `
      *,
      quest:quests!inner (
        *,
        items (*)
      )
    `
    )
    .eq("fid", fid);

  if (filter?.status === "incomplete" || filter?.activeToday) {
    query.gte("quest.endAt", filter?.timeToCompare || new Date().toISOString());
    query.lte(
      "quest.startAt",
      filter?.timeToCompare || new Date().toISOString()
    );
  }

  if (filter?.itemId) {
    query.eq("quest.itemId", filter.itemId);
  }

  if (filter?.category) {
    query.eq("quest.category", filter.category);
  }

  if (filter?.type) {
    query.in("quest.type", filter.type);
  }

  if (filter?.status) {
    query.eq("status", filter.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getQuestsByTypeWithItem = async (
  type: "daily" | "weekly" | "monthly"
): Promise<DbQuestWithItem[]> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("quests")
    .select(
      `
      *,
      items (
        *)
      `
    )
    .eq("type", type)
    .lte("startAt", now)
    .gt("endAt", now)
    .order("endAt", { ascending: true });

  if (error) throw error;
  return data;
};

export const getQuestsByTypeAndLevel = async (
  type: "daily" | "weekly" | "monthly",
  level: number
): Promise<DbQuest[]> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("type", type)
    .eq("level", level)
    .lte("startAt", now)
    .gt("endAt", now)
    .order("endAt", { ascending: true });

  if (error) throw error;
  return data;
};

export const initDailyUserQuests = async (fid: number): Promise<void> => {
  // get user level
  const user = await getUser(fid);
  if (!user) {
    throw new Error("User not found");
  }
  const userXp = user.xp;
  const { currentLevel } = getCurrentLevelAndProgress(userXp);

  let dailyQuests: DbQuest[] = await getQuestsByTypeAndLevel(
    "daily",
    currentLevel
  );

  if (!dailyQuests || dailyQuests.length === 0) {
    dailyQuests = await generateDailyQuests(currentLevel);
  }

  await Promise.all(
    dailyQuests.map((quest) =>
      createUserQuest({
        fid,
        questId: quest.id,
        completedAt: null,
        status: QuestStatus.Incomplete,
        progress: 0,
      })
    )
  );
};

export const initWeeklyUserQuests = async (fid: number): Promise<void> => {
  // get user level
  const user = await getUser(fid);
  if (!user) {
    throw new Error("User not found");
  }
  const userXp = user.xp;
  const { currentLevel } = getCurrentLevelAndProgress(userXp);

  let weeklyQuests: DbQuest[] = await getQuestsByTypeAndLevel(
    "weekly",
    currentLevel
  );

  if (!weeklyQuests || weeklyQuests.length === 0) {
    weeklyQuests = await generateWeeklyQuests(currentLevel);
  }

  await Promise.all(
    weeklyQuests.map((quest) =>
      createUserQuest({
        fid,
        questId: quest.id,
        completedAt: null,
        status: QuestStatus.Incomplete,
        progress: 0,
      })
    )
  );
};

export const initMonthlyUserQuests = async (fid: number): Promise<void> => {
  // get user level
  const user = await getUser(fid);
  if (!user) {
    throw new Error("User not found");
  }
  const userXp = user.xp;
  const { currentLevel } = getCurrentLevelAndProgress(userXp);

  let monthlyQuests: DbQuest[] = await getQuestsByTypeAndLevel(
    "monthly",
    currentLevel
  );

  if (!monthlyQuests || monthlyQuests.length === 0) {
    monthlyQuests = await generateMonthlyQuests(currentLevel);
  }

  await Promise.all(
    monthlyQuests.map((quest) =>
      createUserQuest({
        fid,
        questId: quest.id,
        completedAt: null,
        status: QuestStatus.Incomplete,
        progress: 0,
      })
    )
  );
};

export const getHarvestableCellsCount = async (
  fid: number,
  withinMinutes: number = 3
): Promise<number> => {
  const threeMinutesFromNow = new Date(Date.now() + withinMinutes * 60 * 1000);

  const { count, error } = await supabase
    .from("user_grid_cells")
    .select("*", { count: "exact", head: true })
    .eq("fid", fid)
    .not("harvestAt", "is", null)
    .lte("harvestAt", threeMinutesFromNow.toISOString());

  if (error) throw error;
  return count || 0;
};

export const getExpiredBoostCellsCount = async (
  fid: number,
  withinMinutes: number = 3
): Promise<number> => {
  // Calculate the time window: between (2 hours + withinMinutes) ago and 2 hours ago
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const twoHoursPlusMinutesAgo = new Date(
    Date.now() - (2 * 60 * 60 * 1000 + withinMinutes * 60 * 1000)
  );

  const { count, error } = await supabase
    .from("user_grid_cells")
    .select("*", { count: "exact", head: true })
    .eq("fid", fid)
    .not("speedBoostedAt", "is", null)
    .gte("speedBoostedAt", twoHoursPlusMinutesAgo.toISOString())
    .lt("speedBoostedAt", twoHoursAgo.toISOString());

  if (error) throw error;
  return count || 0;
};

export interface QuestLeaderboardEntry {
  fid: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  completedQuestCount: number;
  xp: number;
}

export const getQuestLeaderboard = async (
  limit: number = 10,
  fids?: string[]
) => {
  let query = supabase
    .from("user_has_quests")
    .select(
      `
      user:users!inner (
        fid,
        username,
        displayName,
        avatarUrl,
        xp
      ),
      count
    `
    )
    .neq("status", "incomplete")
    .order("count", { ascending: false });

  if (fids && fids.length > 0) {
    query = query.in("user.fid", fids);
  }

  const { data, error } = await query.limit(limit);

  if (error) throw error;
  if (!data.length) return [];

  return data;
};

// User Harvested Crops queries
export const getUserHarvestedCrops = async (
  fid: number
): Promise<DbUserHarvestedCrop[]> => {
  const { data, error } = await supabase
    .from("user_harvested_crops")
    .select("*")
    .eq("fid", fid);

  if (error) throw error;
  return data;
};

export const getUserHarvestedCrop = async (
  fid: number,
  crop: string
): Promise<DbUserHarvestedCrop | null> => {
  const { data, error } = await supabase
    .from("user_harvested_crops")
    .select("*")
    .eq("fid", fid)
    .eq("crop", crop)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const incrementUserHarvestedCrop = async (
  fid: number,
  crop: CropType,
  amount: number
): Promise<DbUserHarvestedCrop> => {
  const updatedUserHarvestedCrop = await prisma.userHarvestedCrop.update({
    where: {
      fid_crop: {
        fid,
        crop,
      },
    },
    data: {
      quantity: {
        increment: amount,
      },
    },
  });

  return {
    fid: updatedUserHarvestedCrop.fid,
    crop: updatedUserHarvestedCrop.crop,
    quantity: updatedUserHarvestedCrop.quantity,
    createdAt: updatedUserHarvestedCrop.createdAt.toLocaleDateString(),
  };
};

export const upsertUserHarvestedCrop = async (
  fid: number,
  crop: string,
  quantity: number
): Promise<DbUserHarvestedCrop> => {
  // First fetch the current user harvested crop
  const { data: currentCrop } = await supabase
    .from("user_harvested_crops")
    .select("*")
    .eq("fid", fid)
    .eq("crop", crop)
    .single();

  const { data, error } = await supabase
    .from("user_harvested_crops")
    .upsert(
      {
        fid,
        crop,
        quantity: currentCrop ? currentCrop.quantity + quantity : quantity,
      },
      {
        onConflict: "fid,crop",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUserHarvestedCrop = async (
  fid: number,
  crop: string
): Promise<void> => {
  const { error } = await supabase
    .from("user_harvested_crops")
    .delete()
    .eq("fid", fid)
    .eq("crop", crop);

  if (error) throw error;
};

export const getCollectibles = async (
  category?: string
): Promise<DbCollectible[]> => {
  const query = supabase
    .from("collectibles")
    .select(`*`)
    .order("createdAt", { ascending: false });

  if (category) {
    query.eq("category", category);
  }
  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getCollectibleById = async (
  id: number
): Promise<DbCollectible | null> => {
  const { data, error } = await supabase
    .from("collectibles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getUserCollectibleByCollectibleId = async (
  fid: number,
  collectibleId: number
): Promise<(DbUserHasCollectible & { collectible: DbCollectible }) | null> => {
  const { data, error } = await supabase
    .from("user_has_collectibles")
    .select("*, collectible:collectibles(*)")
    .eq("fid", fid)
    .eq("collectibleId", collectibleId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// User Items queries
export const getUserCollectibles = async (
  fid: number,
  category?: string
): Promise<
  (DbCollectible & { userHasCollectible: DbUserHasCollectible | null })[]
> => {
  const query = supabase
    .from("collectibles")
    .select(`*,user_has_collectibles!left(*)`)
    .eq("user_has_collectibles.fid", fid)
    .order("createdAt", { ascending: false });

  if (category) query.eq("category", category);

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const updateUserCollectible = async (
  fid: number,
  collectibleId: number,
  updatedData: Partial<DbUserHasCollectible>
): Promise<DbUserHasCollectible> => {
  const { data, error } = await supabase
    .from("user_has_collectibles")
    .upsert(
      {
        fid,
        collectibleId,
        ...updatedData,
      },
      {
        onConflict: "fid,collectibleId",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addUserCollectible = async (
  fid: number,
  collectibleId: number,
  status: DbUserHasCollectibleStatus,
  taskId: string
): Promise<DbUserHasCollectible> => {
  const { data, error } = await supabase
    .from("user_has_collectibles")
    .upsert(
      {
        fid,
        collectibleId,
        status,
        generatedTaskId: taskId,
      },
      {
        onConflict: "fid,collectibleId",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeUserCollectible = async (
  fid: number,
  collectibleId: number
): Promise<void> => {
  const { data: existing } = await supabase
    .from("user_has_collectibles")
    .select("*")
    .eq("fid", fid)
    .eq("collectibleId", collectibleId)
    .maybeSingle();

  if (!existing) return;

  const { error } = await supabase
    .from("user_has_collectibles")
    .delete()
    .eq("fid", fid)
    .eq("collectibleId", collectibleId);

  if (error) throw error;
};
