import { NextRequest, NextResponse } from "next/server";
import { getClansLeaderboard } from "@/lib/prisma/queries/clan";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const includeMembers = searchParams.get("includeMembers") === "true";
    const includeLeader = searchParams.get("includeLeader") === "true";

    const clans = await getClansLeaderboard(limit, {
      includeMembers,
      includeLeader,
    });

    return NextResponse.json(clans);
  } catch (error) {
    console.error("Error fetching clans leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch clans leaderboard" },
      { status: 500 }
    );
  }
}