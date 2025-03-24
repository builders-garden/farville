import { NextRequest, NextResponse } from "next/server";
import { getGridCells } from "@/supabase/queries";

export async function GET(
  req: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const fid = parseInt(params.fid);
    if (isNaN(fid)) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }
    const gridCells = await getGridCells(fid);
    return NextResponse.json(gridCells);
  } catch (error) {
    console.error("Error fetching user grid:", error);
    return NextResponse.json(
      { error: "Failed to fetch user grid" },
      { status: 500 }
    );
  }
}
