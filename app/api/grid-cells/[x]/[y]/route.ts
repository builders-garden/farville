import { NextRequest, NextResponse } from "next/server";
import { plantSeed } from "./utils";
import { DbGridCell } from "@/supabase/types";

export const POST = async (
  req: NextRequest,
  res: NextResponse,
  params: { x: string; y: string }
) => {
  const { x, y } = params;
  const { action, seedType } = await req.json();

  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let result: DbGridCell | null = null;

  switch (action) {
    case "plant":
      result = await plantSeed(
        parseInt(fid),
        parseInt(x),
        parseInt(y),
        seedType
      );
      break;
    case "harvest":
      // TODO: Implement harvesting logic
      // TODO: Check if the grid cell is ready to harvest
      // TODO: Call harvestCrop supabase function
      // TODO: Increase player's XP and Crop Count
      // TODO: Return the updated grid cell and rewards XP and Harvested Crop
      break;
    case "fertilize":
      // TODO: Implement fertilizing logic
      // TODO: Check if the grid cell is planted and not ready to harvest
      // TODO: Call fertilizeCrop supabase function
      // TODO: Return the updated grid cell and rewards null
      break;
  }
  return NextResponse.json(result);
};
