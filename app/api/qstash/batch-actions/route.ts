import { NextResponse } from "next/server";
import {
  sendDelayedNotification,
  getGrowthTime,
  getCropNameFromSeeds,
} from "@/lib/game-notifications";
import { trackEvent } from "@/lib/posthog/server";
import { sendQuestsCalculation } from "@/app/api/grid-cells/[x]/[y]/utils";
import { SPEED_BOOST } from "@/lib/game-constants";
import { BoostType } from "../../batch-actions/route";

export const POST = async (req: Request) => {
  const { fid, results } = await req.json();

  for (const result of results) {
    if (!result.success) continue;

    switch (result.type) {
      case "plant":
        await Promise.all([
          sendDelayedNotification(
            fid.toString(),
            `Harvest time! 🌾`,
            `Your ${getCropNameFromSeeds(result.seedType)} are ready to harvest!`,
            "harvest",
            getGrowthTime(result.seedType)
          ),
          sendQuestsCalculation(fid, result.type, result.itemId),
          trackEvent(fid, "planted-seed", {
            seedId: result.itemId,
            cropType: result.cell.cropType,
            cellId: `${result.cell.x}/${result.cell.y}`,
          })
        ]);
        break;

      case "harvest":
        await Promise.all([
          sendQuestsCalculation(fid, result.type, result.itemId, result.rewards.amount),
          trackEvent(fid, "harvested-crop", {
            cropId: result.itemId,
            cropType: result.rewards.cropType,
            cellId: `${result.cell.x}/${result.cell.y}`,
          })
        ]);
        break;

      case "fertilize":
        await Promise.all([
          sendQuestsCalculation(fid, result.type, result.itemId),
          trackEvent(fid, "fertilized-cell", {
            cellId: `${result.cell.x}/${result.cell.y}`,
            cropType: result.cell.cropType,
          })
        ]);
        break;

      case "perk":
        await Promise.all([
          sendQuestsCalculation(fid, "apply-perk", result.itemId),
          sendDelayedNotification(
            fid.toString(),
            `Harvest time! 🌾`,
            `Your ${result.cell.cropType} are ready to harvest!`,
            "harvest",
            new Date(result.cell.harvestAt as Date).getTime() - Date.now()
          ),
          sendDelayedNotification(
            fid.toString(),
            `Speed boost expired! ⚡️`,
            `The speed boost on your ${result.cell.cropType} has worn off.`,
            "boost-expired",
            SPEED_BOOST[result.itemSlug as BoostType].duration / 1000
          ),
          trackEvent(fid, "applied-perk", {
            cellId: `${result.cell.x}/${result.cell.y}`,
            cropType: result.cell.cropType,
            itemSlug: result.itemSlug,
          })
        ]);
        break;
    }

    // Add a small delay between processing each result
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return NextResponse.json({ success: true });
} 