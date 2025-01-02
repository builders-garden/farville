import { getGridCells } from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gridCells = await getGridCells(Number(fid));
  return NextResponse.json(gridCells);
};

export const POST = async (req: NextRequest) => {
  // TODO: Implement logic to expand the grid
  // TODO: Check if user has enough funds for next expansion
  // TODO: Increase expansion level on user
  // TODO: Create new grid cells for user
  // TODO: Decrease user funds
};
