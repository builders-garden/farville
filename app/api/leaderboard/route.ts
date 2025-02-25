import { getUsersByXp, getUsersByFids } from "@/supabase/queries";
import { getQuestLeaderboard } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";
import { fetchUsersFollowedBy } from "@/lib/neynar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetFid = searchParams.get("targetFid");
  const friends = searchParams.get("friends") === "true";
  const type = searchParams.get("type") || "xp";

  // Add cache headers
  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", // Cache for 1 minute, stale for 5 minutes
  };

  try {
    if (friends && targetFid) {
      // Optimize followed users fetch with proper pagination
      const followedUsers = await fetchUsersFollowedBy(
        targetFid,
        300,
        "desc_chron"
      );
      const followedFids = followedUsers.map((user) => user.fid.toString());
      const userFids = [...new Set(followedFids.concat(targetFid))]; // Remove duplicates

      if (type === "quests") {
        const users = await getQuestLeaderboard({
          fids: userFids,
          targetFid,
          limit: 20,
        });
        return NextResponse.json({ users }, { headers });
      }
      const { users } = await getUsersByFids(userFids);
      return NextResponse.json({ users }, { headers });
    }

    // Default behavior with caching
    if (type === "quests") {
      const users = await getQuestLeaderboard({
        limit: 20,
        targetFid: targetFid ? targetFid : undefined,
      });
      return NextResponse.json(users, { headers });
    }

    const users = await getUsersByXp(
      20,
      targetFid ? Number(targetFid) : undefined
    );
    return NextResponse.json(users, { headers });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
