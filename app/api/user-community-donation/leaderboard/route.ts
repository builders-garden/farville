import { getUserCommunityDonationsLeaderboardRaw } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { validMode } from "@/lib/validators/mode";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const mode = searchParams.get("mode");
    const targetFid = searchParams.get("targetFid");

    if (limit && isNaN(Number(limit))) {
      return NextResponse.json(
        { error: "Invalid limit parameter" },
        { status: 400 }
      );
    }

    if (!targetFid || (targetFid && isNaN(Number(targetFid)))) {
      return NextResponse.json(
        { error: "Invalid targetFid parameter" },
        { status: 400 }
      );
    }

    if (!mode || validMode(mode) === false) {
      return NextResponse.json(
        { error: "Invalid mode parameter" },
        { status: 400 }
      );
    }

    console.log("mode", mode, "targetFid", targetFid, "limit", limit);

    const userCommunityDonations =
      await getUserCommunityDonationsLeaderboardRaw(
        Number(limit) || 20,
        mode as Mode,
        Number(targetFid)
      );

    console.log("userCommunityDonations", userCommunityDonations);

    return NextResponse.json(userCommunityDonations);
  } catch (error) {
    console.error("Error fetching user community donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user community donations" },
      { status: 500 }
    );
  }
}
