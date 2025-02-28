import {
  getUserHarvestedCrops,
  upsertUserHarvestedCrop,
} from "@/supabase/queries";
import { CropType } from "@/types/game";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid: stringFid } = await params; // keep this await
    const fid = parseInt(stringFid);
    if (isNaN(fid)) {
      return { status: 400, json: { error: "Invalid FID" } };
    }

    const userHarvestedCrops = await getUserHarvestedCrops(fid);

    return NextResponse.json(userHarvestedCrops);
  } catch (error) {
    console.error("Error fetching user harvested crops:", error);
    return {
      status: 500,
      json: { error: "Failed to fetch user harvested crops" },
    };
  }
}

const requestSchema = z.object({
  crop: z.nativeEnum(CropType),
  amount: z.number().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid: stringFid } = await params;
    const fid = parseInt(stringFid);
    if (isNaN(fid)) {
      return { status: 400, json: { error: "Invalid FID" } };
    }

    const requestBody = requestSchema.safeParse(await request.json());
    if (!requestBody.success) {
      return {
        status: 400,
        json: {
          error: "Invalid request body",
          errors: requestBody.error.errors,
        },
      };
    }

    const harvestedCropData = await upsertUserHarvestedCrop(
      fid,
      requestBody.data.crop,
      requestBody.data.amount
    );

    return NextResponse.json({ harvestedCropData });
  } catch (error) {
    console.error("Error creating user harvested crop:", error);
    return {
      status: 500,
      json: { error: "Failed to create user harvested crop" },
    };
  }
}
