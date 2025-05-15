import { getCurrentCommunityBooster } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userCommunityDonations = await getCurrentCommunityBooster();

    return NextResponse.json(userCommunityDonations);
  } catch (error) {
    console.error("Error fetching user community donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user community donations" },
      { status: 500 }
    );
  }
}
