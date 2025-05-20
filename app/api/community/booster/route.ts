import { env } from "@/lib/env";
import {
  getCommunityBoosterPoints,
  getCurrentCommunityBooster,
} from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import axios from "axios";
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
  txHash: z.string().min(1),
  walletAddress: z.string().min(1),
  dollarAmount: z.number().min(1),
  message: z.string().optional(),
  username: z.string().min(1),
  mode: z.nativeEnum(Mode),
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

    const {
      points,
      txHash,
      walletAddress,
      dollarAmount,
      message,
      username,
      mode,
    } = requestBody.data;

    const result = await axios({
      method: "POST",
      url: `${env.FARVILLE_SERVICE_URL}/api/async-jobs/community-booster`,
      headers: {
        "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
      },
      data: {
        fid: Number(fid),
        txHash,
        walletAddress,
        dollarAmount,
        message,
        points,
        username,
        mode,
      },
    });

    console.log("launched async job to reset harvestAt", result.data);

    return NextResponse.json({
      message: "Points successfully updated",
      data: {
        points,
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
