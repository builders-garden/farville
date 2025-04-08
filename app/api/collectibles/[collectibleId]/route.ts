import { NextRequest, NextResponse } from "next/server";
import { getCollectibleById } from "@/supabase/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collectibleId: string }> }
) {
  try {
    const { collectibleId } = await params;
    if (isNaN(Number(collectibleId))) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const collectible = await getCollectibleById(Number(collectibleId));
    if (!collectible) {
      return NextResponse.json(
        { error: "Collectible not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(collectible);
  } catch (error) {
    console.error("Error fetching collectible by id:", error);
    return NextResponse.json(
      { error: "Failed to fetch collectible by id" },
      { status: 500 }
    );
  }
}
