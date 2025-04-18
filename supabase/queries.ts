import { supabase } from "./client";
import {
  DbItem,
  DbUser,
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
  DbUserHarvestedCrop,
  DbCollectible,
  DbUserHasCollectible,
} from "./types";
import { SPEED_BOOST } from "@/lib/game-constants";
import { CropType, PerkType, QuestStatus } from "@/lib/types/game";
import { getBoostTime, getLevelThresholdLeagueByLeague } from "@/lib/utils";
import { generateDailyQuests, generateWeeklyQuests } from "./quests";
import { prisma } from "@/lib/prisma/client";
import { getUserByMode, getUserLeaderboardEntry } from "@/lib/prisma/queries";

// export interface GameStats {
//   totalUsers: number;
//   totalReferrals: number;
//   totalUsersLastWeek: number;
// }

// export async function getStats(): Promise<GameStats> {
//   // Get total users
//   const { count: totalUsers, error: usersError } = await supabase
//     .from("users")
//     .select("*", { count: "exact", head: true });

//   if (usersError) throw usersError;

//   // Get total referrals
//   const { count: totalReferrals, error: referralsError } = await supabase
//     .from("referrals")
//     .select("*", { count: "exact", head: true });

//   if (referralsError) throw referralsError;

//   // Get users from last week
//   const lastWeek = new Date();
//   lastWeek.setDate(lastWeek.getDate() - 7);
//   const lastWeekISO = lastWeek.toISOString();

//   const { count: totalUsersLastWeek, error: recentUsersError } = await supabase
//     .from("users")
//     .select("*", { count: "exact", head: true })
//     .gte("createdAt", lastWeekISO);

//   if (recentUsersError) throw recentUsersError;

//   return {
//     totalUsers: totalUsers || 0,
//     totalReferrals: totalReferrals || 0,
//     totalUsersLastWeek: totalUsersLastWeek || 0,
//   };
// }

export const initDailyUserQuests = async (fid: number): Promise<void> => {
  // get user level
  const user = await getUserByMode(fid);
  if (!user) {
    throw new Error("User not found");
  }

  const userLeague = (await getUserLeaderboardEntry(fid))?.league || 0;

  const thresholdLevel = getLevelThresholdLeagueByLeague(userLeague);

  let dailyQuests: DbQuest[] = await getQuestsByTypeAndLevel(
    "daily",
    thresholdLevel
  );

  if (!dailyQuests || dailyQuests.length === 0) {
    dailyQuests = await generateDailyQuests(thresholdLevel);
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
  const user = await getUserByMode(fid);
  if (!user) {
    throw new Error("User not found");
  }

  const userLeague = (await getUserLeaderboardEntry(fid))?.league || 0;

  const thresholdLevel = getLevelThresholdLeagueByLeague(userLeague);

  let weeklyQuests: DbQuest[] = await getQuestsByTypeAndLevel(
    "weekly",
    thresholdLevel
  );

  if (!weeklyQuests || weeklyQuests.length === 0) {
    weeklyQuests = await generateWeeklyQuests(thresholdLevel);
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

export const updateUserCollectibleAsAvatar = async (
  fid: number,
  collectibleId: number
): Promise<DbUser> => {
  const { data, error } = await supabase
    .from("user_has_collectibles")
    .select("*")
    .eq("fid", fid)
    .eq("collectibleId", collectibleId)
    .maybeSingle();
  console.log("data on update user collectible as avatar", data);

  if (error) throw error;
  if (!data) throw new Error("Collectible not found");

  if (!data.mintedImageUrl) throw new Error("User minted image not found");
  // change image url from https://gateway.pinata.cloud/ipfs/<CID> to https://<CID>.ipfs.dweb.link
  let imageUrl = data.mintedImageUrl;
  if (imageUrl.startsWith("https://gateway.pinata.cloud/ipfs/")) {
    imageUrl = imageUrl.replace(
      "https://gateway.pinata.cloud/ipfs/",
      "https://"
    );
    imageUrl += ".ipfs.dweb.link";
  }

  const { data: userData, error: updateError } = await supabase
    .from("users")
    .update({
      selectedAvatarUrl: imageUrl,
    })
    .eq("fid", fid)
    .select()
    .single();

  if (updateError) throw updateError;
  return userData;
};

export const resetUserAvatar = async (fid: number): Promise<DbUser> => {
  const { data, error } = await supabase
    .from("users")
    .update({
      selectedAvatarUrl: null,
    })
    .eq("fid", fid)
    .select()
    .single();

  if (error) throw error;
  return data;
};
