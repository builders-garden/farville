import { getUsersByXp, getUsersByFids } from "@/supabase/queries";
import { NextResponse } from "next/server";
import { fetchUsersFollowedBy } from "@/lib/neynar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetFid = searchParams.get("targetFid");
  const friends = searchParams.get("friends") === "true";

  try {
    if (friends && targetFid) {
      // Fetch users that targetFid follows
      const followedUsers = await fetchUsersFollowedBy(targetFid);
      const followedFids = followedUsers.map((user) => user.fid.toString());
      // Get these users from database, ordered by XP
      const { users } = await getUsersByFids(followedFids.concat(targetFid));
      return NextResponse.json({
        users,
      });
    }

    // Default behavior - get top users by XP
    const users = await getUsersByXp(
      20,
      targetFid ? Number(targetFid) : undefined
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
