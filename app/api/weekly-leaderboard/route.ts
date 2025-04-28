import { getWeeklyUserLeaderboardByLeague } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";
import { Mode } from "@/lib/types/game";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetFid = searchParams.get("targetFid");
  const league = searchParams.get("league") || "3";
  const currentWeek = searchParams.get("currentWeek") || "true";
  const limit = searchParams.get("limit") || "20";
  const mode = (searchParams.get("mode") as Mode) || Mode.Classic;

  // Add cache headers
  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", // Cache for 1 minute, stale for 5 minutes
  };

  try {
    const usersWeekSummaries = await getWeeklyUserLeaderboardByLeague(
      Number(league),
      currentWeek === "true",
      Number(limit),
      mode,
      Number(targetFid)
    );
    return NextResponse.json(usersWeekSummaries, { headers });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
