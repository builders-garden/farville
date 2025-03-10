import { NextResponse } from "next/server";
import { getPartialLeaderboardBasedOnFid } from "@/lib/utils";

export async function GET(
  request: Request,
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
  const { searchParams } = new URL(request.url);
  // const targetFid = searchParams.get("targetFid");
  const friends = searchParams.get("friends") === "true";
  const type = searchParams.get("type") || "xp";
  const limit = searchParams.get("limit") || 20;

  // Add cache headers
  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", // Cache for 1 minute, stale for 5 minutes
  };

  try {
    const partialLeaderboard = await getPartialLeaderboardBasedOnFid(
      targetFid,
      {
        friends,
        type: type as "quests" | "xp",
        limit: Number(limit),
      }
    );

    return NextResponse.json(partialLeaderboard, { headers });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
