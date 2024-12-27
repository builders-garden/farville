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
    .single();

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
  return data?.notificationDetails;
};

export const setUserNotificationDetails = async (
  fid: number,
  details: FrameNotificationDetails
): Promise<void> => {
  await supabase
    .from("users")
    .update({ notificationDetails: details })
    .eq("fid", fid);
};

export const deleteUserNotificationDetails = async (fid: number): Promise<void> => {
  await supabase.from("users").update({ notificationDetails: null }).eq("fid", fid);
};
