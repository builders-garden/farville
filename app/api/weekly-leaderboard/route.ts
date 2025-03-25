import { getWeeklyUserLeaderboardByLeague } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetFid = searchParams.get("targetFid");
  const league = searchParams.get("league") || "3";
  const currentWeek = searchParams.get("currentWeek") || "true";

  try {
    const usersWeekSummaries = await getWeeklyUserLeaderboardByLeague(
      Number(league),
      currentWeek === "true",
      10,
      Number(targetFid)
    );
    return NextResponse.json(usersWeekSummaries);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
