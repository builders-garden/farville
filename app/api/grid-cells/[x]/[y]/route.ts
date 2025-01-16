import { NextRequest, NextResponse } from "next/server";
import {
  calculateUserQuestsProgress,
  fertilize,
  harvest,
  plantSeed,
} from "./utils";
import {
  sendDelayedNotification,
  getGrowthTime,
  getCropNameFromSeeds,
} from "@/lib/game-notifications";
import { z } from "zod";
import { ActionType, SeedType } from "@/types/game";
import { DbUserHasQuest } from "@/supabase/types";

const requestSchema = z.object({
  action: z.nativeEnum(ActionType),
  seedType: z.nativeEnum(SeedType).optional(),
});

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ x: string; y: string }>;
  }
) {
  // Await the params
  const { x, y } = await Promise.resolve(params);
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

  let result: {
    rewards?: { xp: number; amount: number };
    quests: DbUserHasQuest[];
  } | null = null;

  switch (action) {
    case "plant":
      if (!seedType) {
        return NextResponse.json(
          { error: "Missing seedType for plant action" },
          { status: 400 }
        );
      }
      const plantedItem = await plantSeed(
        parseInt(fid),
        parseInt(x),
        parseInt(y),
        seedType
      );
      await sendDelayedNotification(
        fid,
        `Harvest time! 🌾`,
        `Your ${getCropNameFromSeeds(seedType)} are ready to harvest!`,
        "harvest",
        getGrowthTime(seedType)
      );
      await calculateUserQuestsProgress(parseInt(fid), "plant", plantedItem.id);
      break;
    case "harvest":
      const harvestResult = await harvest(
        parseInt(fid),
        parseInt(x),
        parseInt(y)
      );
      result = {
        rewards: harvestResult.rewards,
        quests:
          (await calculateUserQuestsProgress(
            parseInt(fid),
            "harvest",
            harvestResult.crop.id,
            harvestResult.rewards.amount
          )) || [],
      };
      break;
    case "fertilize":
      await fertilize(parseInt(fid), parseInt(x), parseInt(y));
      result = {
        quests:
          (await calculateUserQuestsProgress(parseInt(fid), "fertilize", 9)) || [],
      };
      break;
  }
  return NextResponse.json(result);
}
