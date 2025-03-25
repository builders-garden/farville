import { NextResponse } from "next/server";
import { getUserLeaderboardEntry } from "@/lib/prisma/queries";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      fid: string;
    }>;
  }
) {
  const { fid: targetFid } = await params;
  if (!targetFid || isNaN(Number(targetFid))) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard: invalid target fid" },
      { status: 400 }
    );
  }

  try {
    const userWeeklyStats = await getUserLeaderboardEntry(Number(targetFid));

    return NextResponse.json(userWeeklyStats);
  } catch (error) {
    console.error("Weekly Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Weekly Stats" },
      { status: 500 }
    );
  }
}
