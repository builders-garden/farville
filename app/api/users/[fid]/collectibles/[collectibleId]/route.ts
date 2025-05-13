import { getUserCollectibleByCollectibleId } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fid: string; collectibleId: string }> }
) {
  try {
    const { fid, collectibleId } = await params;
    if (isNaN(Number(fid)) || isNaN(Number(collectibleId))) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const collectible = await getUserCollectibleByCollectibleId(
      Number(fid),
      Number(collectibleId)
    );
    if (!collectible) {
      return NextResponse.json(
        { error: "Collectible not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(collectible);
  } catch (error) {
    console.error("Error fetching user collectible:", error);
    return NextResponse.json(
      { error: "Failed to fetch user collectible" },
      { status: 500 }
    );
  }
}
