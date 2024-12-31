import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { supabase } from "./client";
import { DbItem, DbUser, DbUserHasItem, InsertDbUser } from "./types";

// Items queries
export const getItems = async (): Promise<DbItem[]> => {
  const { data, error } = await supabase.from("items").select("*");

  if (error) throw error;
  return data;
};

export const getItemsByCategory = async (
  category: string
): Promise<DbItem[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("category", category);

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

export const getUsersByXp = async (limit?: number): Promise<DbUser[]> => {
  const query = supabase
    .from("users")
    .select("*")
    .order("xp", { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// User Items queries
export const getUserItems = async (
  userFid: number
): Promise<DbUserHasItem[]> => {
  const { data, error } = await supabase
    .from("user_has_items")
    .select("*")
    .eq("userFid", userFid);

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
    .upsert({
      userFid,
      itemId,
      quantity: existing ? existing.quantity + quantity : quantity,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeUserItem = async (
  userFid: number,
  itemId: number
): Promise<void> => {
  const { data: existing } = await supabase
    .from("user_has_items")
    .select("*")
    .eq("userFid", userFid)
    .eq("itemId", itemId)
    .single();

  if (!existing) return;

  if (existing.quantity <= 1) {
    const { error } = await supabase
      .from("user_has_items")
      .delete()
      .eq("userFid", userFid)
      .eq("itemId", itemId);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_has_items")
      .update({ quantity: existing.quantity - 1 })
      .eq("userFid", userFid)
      .eq("itemId", itemId);

    if (error) throw error;
  }
};

// Notifications queries
export const getUserNotificationDetails = async (
  fid: number
): Promise<FrameNotificationDetails> => {
  const { data, error } = await supabase
    .from("users")
    .select("notificationDetails")
    .eq("fid", fid)
    .single();

  if (error) throw error;
  return data?.notificationDetails
    ? JSON.parse(data.notificationDetails)
    : null;
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
  await supabase.from("referrals").upsert({
    fid: referrer,
    referredFid: referred,
  }, {
    onConflict: 'fid,referredFid'
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

export interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  referralCount: number;
  xp: number;
}

export async function getLeaderboard(
  limit: number = 10
): Promise<LeaderboardEntry[]> {
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
