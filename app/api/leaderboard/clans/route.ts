import { NextRequest, NextResponse } from "next/server";
import {
  getClansLeaderboard,
  getClansLeaderboardWithUserRank,
} from "@/lib/prisma/queries/clan";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const includeMembers = searchParams.get("includeMembers") === "true";
    const includeLeader = searchParams.get("includeLeader") === "true";
    const userClanId = searchParams.get("userClanId");

    if (userClanId) {
      // If user clan ID is provided, get leaderboard with user clan rank
      const result = await getClansLeaderboardWithUserRank(userClanId, limit, {
        includeMembers,
        includeLeader,
      });
      return NextResponse.json(result);
    } else {
      // Original behavior for when no user clan ID is provided
      const clans = await getClansLeaderboard(limit, {
        includeMembers,
        includeLeader,
      });
      return NextResponse.json({ clans });
    }
  } catch (err) {
    console.error(
      "Error fetching clans leaderboard:",
      err instanceof Error ? err.message : String(err)
    );
    return NextResponse.json(
      { error: "Failed to fetch clans leaderboard" },
      { status: 500 }
    );
  }
}
