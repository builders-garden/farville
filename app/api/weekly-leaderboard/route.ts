import { getWeeklyUserLeaderboardByLeague } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetFid = searchParams.get("targetFid");
  const league = searchParams.get("league") || "3";
  const currentWeek = searchParams.get("currentWeek") || "true";

  // Add cache headers
  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", // Cache for 1 minute, stale for 5 minutes
  };

  try {
    const usersWeekSummaries = await getWeeklyUserLeaderboardByLeague(
      Number(league),
      currentWeek === "true",
      10,
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
