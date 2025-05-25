import { getLastUserCommunityDonations } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const mode = searchParams.get("mode");
    const fid = searchParams.get("fid");

    console.log("GET /api/community/donation", {
      limit,
      mode,
      fid,
    });

    if (limit && isNaN(Number(limit))) {
      return NextResponse.json(
        { error: "Invalid limit parameter" },
        { status: 400 }
      );
    }

    if (!mode) {
      return NextResponse.json({ error: "Mode is required" }, { status: 400 });
    }

    const userCommunityDonations = await getLastUserCommunityDonations(
      mode as Mode,
      fid ? Number(fid) : undefined,
      Number(limit) || 10
    );

    return NextResponse.json(userCommunityDonations);
  } catch (error) {
    console.error("Error fetching user community donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user community donations" },
      { status: 500 }
    );
  }
}
