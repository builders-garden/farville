import { NextRequest, NextResponse } from "next/server";
import { SeedType, PerkType } from "@/types/game";
import { harvestBulk, perkBulk, plantBulk } from "./utils";

export interface GridBulkRequest {
  action: string;
  itemSlug?: string;
  cells: {
    x: number;
    y: number;
  }[];
}

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { action, cells, itemSlug }: GridBulkRequest = await req.json();

  switch (action) {
    case "plant":
      if (!itemSlug) {
        return NextResponse.json(
          { error: "Item slug is required" },
          { status: 400 }
        );
      }
      if (!Object.values(SeedType).includes(itemSlug as SeedType)) {
        return NextResponse.json(
          { error: "Invalid item slug" },
          { status: 400 }
        );
      }
      const plantResult = await plantBulk(
        Number(fid),
        cells,
        itemSlug as SeedType
      );
      return NextResponse.json({
        success: true,
        data: plantResult,
      });
    case "harvest":
      const harvestResult = await harvestBulk(Number(fid), cells);
      console.log({ harvestResult });
      return NextResponse.json({
        success: true,
        data: harvestResult,
      });
    case "apply-perk":
      if (!itemSlug) {
        return NextResponse.json(
          { error: "Item slug is required" },
          { status: 400 }
        );
      }
      if (!Object.values(PerkType).includes(itemSlug as PerkType)) {
        return NextResponse.json(
          { error: "Invalid item slug" },
          { status: 400 }
        );
      }
      const perkResult = await perkBulk(
        Number(fid),
        cells,
        itemSlug as PerkType
      );
      return NextResponse.json({
        success: true,
        data: perkResult,
      });
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
};
