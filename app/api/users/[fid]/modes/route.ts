import { getUserModes } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

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

    const userModes = await getUserModes(fid);

    return NextResponse.json(userModes);
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
