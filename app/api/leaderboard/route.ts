import {
  getQuestLeaderboard,
  getUsersByFidsAndMode,
  getUsersByXp,
} from "@/lib/prisma/queries";
import { NextResponse } from "next/server";
import { fetchUsersFollowedBy } from "@/lib/neynar";
import { Mode } from "@/lib/types/game";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetFid = searchParams.get("targetFid");
  const friends = searchParams.get("friends") === "true";
  const type = searchParams.get("type") || "xp";
  const mode = (searchParams.get("mode") as Mode) || Mode.Classic;

  // Add cache headers
  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", // Cache for 1 minute, stale for 5 minutes
  };

  try {
    if (friends && targetFid) {
      // Optimize followed users fetch with proper pagination
      const followedUsers = await fetchUsersFollowedBy(
        targetFid,
        500,
        "desc_chron"
      );
      const followedFids = followedUsers.map((user) => user.fid.toString());
      const userFids = [...new Set(followedFids.concat(targetFid))]; // Remove duplicates

      if (type === "quests") {
        const users = await getQuestLeaderboard({
          fids: userFids,
          targetFid,
          limit: 20,
          mode,
        });
        return NextResponse.json({ users }, { headers });
      }
      const { users } = await getUsersByFidsAndMode(userFids, mode);
      return NextResponse.json({ users }, { headers });
    }

    // Default behavior with caching
    if (type === "quests") {
      const users = await getQuestLeaderboard({
        limit: 20,
        targetFid: targetFid ? targetFid : undefined,
        mode,
      });
      return NextResponse.json(users, { headers });
    }

    const users = await getUsersByXp(
      mode,
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
