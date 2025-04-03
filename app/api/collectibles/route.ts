import { NextRequest, NextResponse } from "next/server";
import { getCollectibles } from "@/supabase/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const collectibles = await getCollectibles(category ?? undefined);

    return NextResponse.json(collectibles);
  } catch (error) {
    console.error("Error fetching all the collectibles:", error);
    return NextResponse.json(
      { error: "Failed to fetch all the collectibles" },
      { status: 500 }
    );
  }
}
