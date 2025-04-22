import {
  getUserHarvestedCrops,
  upsertUserHarvestedCrop,
} from "@/lib/prisma/queries";
import { CropType } from "@/lib/types/game";
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
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const userHarvestedCrops = await getUserHarvestedCrops(fid);

    return NextResponse.json(userHarvestedCrops);
  } catch (error) {
    console.error("Error fetching user harvested crops:", error);
    return NextResponse.json(
      {
        status: "nok",
        error: "Failed to fetch user harvested crops",
      },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const requestBody = requestSchema.safeParse(await request.json());
    if (!requestBody.success) {
      return NextResponse.json({ error: requestBody.error }, { status: 400 });
    }

    const harvestedCropData = await upsertUserHarvestedCrop(
      fid,
      requestBody.data.crop,
      requestBody.data.amount
    );

    return NextResponse.json({ harvestedCropData });
  } catch (error) {
    console.error("Error creating user harvested crop:", error);
    return NextResponse.json(
      {
        status: "nok",
        error: "Failed to create user harvested crop",
      },
      { status: 500 }
    );
  }
}
