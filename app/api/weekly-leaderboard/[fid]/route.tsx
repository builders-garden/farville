import { NextRequest, NextResponse } from "next/server";
import { getUserLeaderboardEntry } from "@/lib/prisma/queries";
import { validMode } from "@/lib/validators/mode";
import { Mode } from "@/lib/types/game";

export async function GET(
  request: NextRequest,
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

  const mode = request.nextUrl.searchParams.get("mode") || undefined;
  if (mode && !validMode(mode)) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard: invalid mode" },
      { status: 400 }
    );
  }

  try {
    const userWeeklyStats = await getUserLeaderboardEntry(
      Number(targetFid),
      mode as Mode
    );

    return NextResponse.json(userWeeklyStats);
  } catch (error) {
    console.error("Weekly Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Weekly Stats" },
      { status: 500 }
    );
  }
}
