import {
  decrementCommunityBoosterPoints,
  getCommunityBoosterPoints,
  getCurrentCommunityBooster,
  incrementCommunityBoosterPoints,
} from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try {
    const userCommunityDonations = await getCurrentCommunityBooster();
    const communityBoosterPoints = await getCommunityBoosterPoints();

    return NextResponse.json({
      ...userCommunityDonations,
      points: communityBoosterPoints,
    });
  } catch (error) {
    console.error("Error fetching user community donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user community donations" },
      { status: 500 }
    );
  }
}

const requestSchema = z.object({
  points: z.number().min(1),
  operation: z.enum(["increment", "decrement"]),
});

export async function POST(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");

    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestJson = await req.json();
    const requestBody = requestSchema.safeParse(requestJson);

    if (requestBody.success === false) {
      return NextResponse.json(
        { success: false, errors: requestBody.error.errors },
        { status: 400 }
      );
    }

    const { points, operation } = requestBody.data;

    let updatedPoints = 0;
    if (operation === "increment") {
      updatedPoints = await incrementCommunityBoosterPoints(points);
    } else if (operation === "decrement") {
      updatedPoints = await decrementCommunityBoosterPoints(points);
    }

    return NextResponse.json({
      message: "Points successfully updated",
      data: {
        points: updatedPoints,
      },
    });
  } catch (error) {
    console.error("Error adding community booster points:", error);
    return NextResponse.json(
      { error: "Failed to add community booster points" },
      { status: 500 }
    );
  }
}
