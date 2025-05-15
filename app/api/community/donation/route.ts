import {
  getLastUserCommunityDonations,
  createUserCommunityDonation,
} from "@/lib/prisma/queries";
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

    const userCommunityDonations = await getLastUserCommunityDonations(
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, mode, fid, ptAmount, dollarAmount, walletAddress } = body;

    // TODO: ptAmount must be calculated here using the combo value from DB

    // Validate required fields
    if (
      !txHash ||
      !mode ||
      !fid ||
      !ptAmount ||
      !dollarAmount ||
      !walletAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const donation = await createUserCommunityDonation({
      txHash,
      mode,
      fid,
      ptAmount,
      dollarAmount,
      walletAddress,
    });

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error creating user community donation:", error);
    return NextResponse.json(
      { error: "Failed to create user community donation" },
      { status: 500 }
    );
  }
}
