import { NextRequest, NextResponse } from "next/server";
import { SeedType } from "@/types/game";
import { harvestBulk, perkBulk, plantBulk } from "./utils";

interface PlantBulkRequest {
  fid: string;
  action: string;
  seedType: SeedType;
  itemSlug: string;
  cells: {
    x: number;
    y: number;
  }[];
}

export const POST = async (req: NextRequest) => {
  // const fid = req.headers.get("x-user-fid");
  // if (!fid) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const { fid, action, seedType, cells, itemSlug }: PlantBulkRequest =
    await req.json();

  switch (action) {
    case "plant":
      const plantResult = await plantBulk(Number(fid), cells, seedType);
      return NextResponse.json({
        success: true,
        data: plantResult,
      });
    case "harvest":
      const harvestResult = await harvestBulk(Number(fid), cells);
      return NextResponse.json({
        success: true,
        data: harvestResult,
      });
    case "apply-perk":
      const perkResult = await perkBulk(Number(fid), cells, itemSlug);
      return NextResponse.json({
        success: true,
        data: perkResult,
      });
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
};
