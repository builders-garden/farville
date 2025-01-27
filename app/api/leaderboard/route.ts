import { getUsersByXp, getUsersByFids } from "@/supabase/queries";
import { getQuestLeaderboard } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";
import { fetchUsersFollowedBy } from "@/lib/neynar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetFid = searchParams.get("targetFid");
  const friends = searchParams.get("friends") === "true";
  const type = searchParams.get("type") || "xp";

  try {
    if (friends && targetFid) {
      // Fetch users that targetFid follows
      let followedUsers = await fetchUsersFollowedBy(targetFid, 300);
      if (followedUsers.length === 0) {
        followedUsers = await fetchUsersFollowedBy(
          targetFid,
          100,
          "desc_chron"
        );
      }
      const followedFids = followedUsers.map((user) => user.fid.toString());

      // Get these users from database, ordered by XP or quest count
      if (type === "quests") {
        const users = await getQuestLeaderboard({
          fids: followedFids.concat(targetFid),
          targetFid,
        });
        return NextResponse.json({users});
      }
      const { users } = await getUsersByFids(followedFids.concat(targetFid));
      return NextResponse.json({ users });
    }

    // Default behavior - get top users by XP or quest count
    if (type === "quests") {
      const users = await getQuestLeaderboard({
        limit: 20,
        targetFid: targetFid ? targetFid : undefined,
      });
      return NextResponse.json(users);
    }
    const users = await getUsersByXp(
      20,
      targetFid ? Number(targetFid) : undefined
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error({ error: JSON.stringify(error) });
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
