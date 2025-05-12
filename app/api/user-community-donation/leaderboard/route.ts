import { getUserCommunityDonationsLeaderboardRaw } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    if (limit && isNaN(Number(limit))) {
      return NextResponse.json(
        { error: "Invalid limit parameter" },
        { status: 400 }
      );
    }

    const userCommunityDonations =
      await getUserCommunityDonationsLeaderboardRaw(Number(limit) || 10);

    return NextResponse.json(userCommunityDonations);
  } catch (error) {
    console.error("Error fetching user community donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user community donations" },
      { status: 500 }
    );
  }
}
