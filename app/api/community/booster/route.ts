import { env } from "@/lib/env";
import {
  getCommunityBoosterPoints,
  getCurrentCommunityBooster,
} from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const mode = req.nextUrl.searchParams.get("mode") as Mode;
    if (!mode) {
      return NextResponse.json({ error: "Mode is required" }, { status: 400 });
    }

    const userCommunityDonations = await getCurrentCommunityBooster(mode);
    const communityBoosterPoints = await getCommunityBoosterPoints(mode);

    return NextResponse.json({
      ...userCommunityDonations,
      donation: {
        ...userCommunityDonations?.donation,
        createdAt: userCommunityDonations?.donation?.createdAt ?? new Date(),
      },
      points: communityBoosterPoints.points,
      combo: communityBoosterPoints.combo,
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
  paymentId: z.string().min(1),
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

    const { paymentId, message, username, mode } = requestBody.data;

    const donationId = uuid();

    await axios({
      method: "POST",
      url: `${env.FARVILLE_SERVICE_URL}/api/async-jobs/community-booster`,
      headers: {
        "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
      },
      data: {
        fid: Number(fid),
        paymentId,
        donationId,
        message,
        username,
        mode,
      },
    });

    return NextResponse.json({
      message: "Points successfully updated",
      data: {
        donationId,
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
