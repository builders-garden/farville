import { NextRequest, NextResponse } from "next/server";
import { fertilize, handlePerk, harvest, plantSeed, sendQuestsCalculation } from "./utils";
import {
  sendDelayedNotification,
  getGrowthTime,
  getCropNameFromSeeds,
} from "@/lib/game-notifications";
import { z } from "zod";
import { ActionType, SeedType } from "@/types/game";
import { trackEvent } from "@/lib/posthog/server";
import { SPEED_BOOST } from "@/lib/game-constants";

const requestSchema = z.object({
  action: z.nativeEnum(ActionType),
  seedType: z.nativeEnum(SeedType).optional(),
  itemSlug: z.string().optional(),
  itemId: z.number().optional(),
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
  const { action, seedType, itemSlug, itemId } = requestBody.data;
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let result: {
    crop?: { id: number; slug: string };
    rewards?: { xp: number; amount: number };
  } | null = null;

  try {
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
          fid.toString(),
          `Harvest time! 🌾`,
          `Your ${getCropNameFromSeeds(seedType)} are ready to harvest!`,
          "harvest",
          getGrowthTime(seedType)
        );
        await sendQuestsCalculation(parseInt(fid), "plant", plantedItem.id);
        trackEvent(Number(fid), "planted-seed", {
          seedId: plantedItem.id,
          cropType: plantedItem.slug.replace("-seeds", ""),
          cellId: `${x}/${y}`,
        });
        break;
      case "harvest":
        const harvestResult = await harvest(
          parseInt(fid),
          parseInt(x),
          parseInt(y)
        );
        await sendQuestsCalculation(
          parseInt(fid),
          "harvest",
          harvestResult.crop.id,
          harvestResult.rewards.amount
        );
        result = {
          crop: harvestResult.crop,
          rewards: harvestResult.rewards,
        };
        trackEvent(Number(fid), "harvested-crop", {
          cropId: harvestResult.crop.id,
          cropType: harvestResult.crop.slug,
          cellId: `${x}/${y}`,
        });
        break;
      case "fertilize":
        const cell = await fertilize(parseInt(fid), parseInt(x), parseInt(y));
        await sendQuestsCalculation(parseInt(fid), "fertilize", 9);
        trackEvent(Number(fid), "fertilized-cell", {
          cellId: `${x}/${y}`,
          cropType: cell?.cropType,
        });
        break;
      case "apply-perk":
        const perkCell = await handlePerk(
          parseInt(fid),
          parseInt(x),
          parseInt(y),
          itemSlug as string
        );
        await Promise.all([
          sendQuestsCalculation(parseInt(fid), "apply-perk", itemId),
          sendDelayedNotification(
            fid.toString(),
            `Harvest time! 🌾`,
            `Your ${perkCell?.cropType} are ready to harvest!`,
            "harvest",
            new Date(perkCell?.harvestAt as string).getTime() - Date.now()
          ),
          sendDelayedNotification(
            fid.toString(),
            `Speed boost expired! ⚡️`,
            `The speed boost on your ${perkCell?.cropType} has worn off.`,
            "boost-expired",
            SPEED_BOOST[itemSlug as keyof typeof SPEED_BOOST].duration
          ),
        ]);
        trackEvent(Number(fid), "applied-perk", {
          cellId: `${x}/${y}`,
          cropType: perkCell?.cropType,
          itemSlug,
        });
        break;
    }
    return NextResponse.json(result);
  } catch (err) { 
    console.error("Failed to perform action:", err);
    return NextResponse.json(
      { error: "Failed to perform action", message: (err as Error).message },
      { status: 400 }
    );
  }
}
