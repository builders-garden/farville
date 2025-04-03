import { NextRequest, NextResponse } from "next/server";
import { getUserCollectibles } from "@/supabase/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid: stringFid } = await params; // keep this await
    const fid = parseInt(stringFid);
    if (isNaN(fid)) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const collectibles = await getUserCollectibles(fid, category ?? undefined);

    return NextResponse.json(collectibles);
  } catch (error) {
    console.error("Error fetching user collectibles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user collectibles" },
      { status: 500 }
    );
  }
}
