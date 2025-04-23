import { NextRequest, NextResponse } from "next/server";
import { SeedType, PerkType, ActionType, Mode } from "@/lib/types/game";
import { fertilizeBulk, harvestBulk, perkBulk, plantBulk } from "./utils";
import { z } from "zod";
import { getUserByMode } from "@/lib/prisma/queries";

export interface GridBulkRequest {
  action: ActionType;
  itemSlug?: SeedType | PerkType;
  cells: {
    x: number;
    y: number;
  }[];
  mode: Mode;
}

const requestSchema = z.object({
  action: z.nativeEnum(ActionType),
  itemSlug: z
    .union([z.nativeEnum(SeedType), z.nativeEnum(PerkType)])
    .optional(),
  cells: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
    })
  ),
  mode: z.nativeEnum(Mode).default(Mode.Classic),
});

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");

  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByMode(Number(fid));

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { action, itemSlug, cells, mode } = requestBody.data;

  try {
    switch (action) {
      case ActionType.Plant:
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
          itemSlug as SeedType,
          mode
        );
        return NextResponse.json({
          success: true,
          data: plantResult,
        });
      case ActionType.Harvest:
        const harvestResult = await harvestBulk(Number(fid), cells, mode);
        return NextResponse.json({
          success: true,
          data: harvestResult,
        });
      case ActionType.ApplyPerk:
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
      case ActionType.Fertilize:
        const fertilizeResult = await fertilizeBulk(Number(fid), cells);
        return NextResponse.json({
          success: true,
          data: fertilizeResult,
        });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error({ action, cells, error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
