import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  res: NextResponse,
  params: { x: string; y: string }
) => {
  const { x, y } = params;
  const { action } = await req.json();

  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  switch (action) {
    case "plant":
      // TODO: Implement planting logic
      // TODO: Check if the grid cell is already planted
      // TODO: Check if the player has enough seeds of "crop_type" to plant
      // TODO: Call plantCrop supabase function
      // TODO: Decrease player's seed count
      // TODO: Return the updated grid cell and rewards null
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
};
