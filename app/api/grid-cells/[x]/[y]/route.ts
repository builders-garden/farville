import { NextRequest, NextResponse } from "next/server";
import { fertilize, harvest, plantSeed } from "./utils";
import {
  sendDelayedNotification,
  getGrowthTime,
  getCropNameFromSeeds,
} from "@/lib/game-notifications";
import { z } from "zod";

enum ActionType {
  Plant = "plant",
  Harvest = "harvest",
  Fertilize = "fertilize",
}

enum SeedType {
  CarrotSeeds = "carrot-seeds",
  PumpkinSeeds = "pumpkin-seeds",
  TomatoSeeds = "tomato-seeds",
  PotatoSeeds = "potato-seeds",
}

const requestSchema = z.object({
  action: z.nativeEnum(ActionType),
  seedType: z.nativeEnum(SeedType).optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: { x: string; y: string } }
) {
  // Await the params
  const { x, y } = await Promise.resolve(context.params);
  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);
  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }
  const { action, seedType } = requestBody.data;

  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let result: { rewards?: { xp: number; amount: number } } | null = null;

  switch (action) {
    case "plant":
      if (!seedType) {
        return NextResponse.json(
          { error: "Missing seedType for plant action" },
          { status: 400 }
        );
      }
      await plantSeed(parseInt(fid), parseInt(x), parseInt(y), seedType);
      await sendDelayedNotification(
        fid,
        `Harvest time! 🌾`,
        `Your ${getCropNameFromSeeds(seedType)} are ready to harvest!`,
        "harvest",
        getGrowthTime(seedType)
      );
      break;
    case "harvest":
      result = await harvest(parseInt(fid), parseInt(x), parseInt(y));
      break;
    case "fertilize":
      await fertilize(parseInt(fid), parseInt(x), parseInt(y));
      break;
  }
  return NextResponse.json(result);
}
