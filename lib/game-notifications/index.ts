import { SeedType } from "@/types/game";
import { qstashPublishJSON } from "../qstash";
import { GROWTH_TIMES } from "@/lib/game-constants";

export async function sendDelayedNotification(
  fid: string,
  title: string,
  text: string,
  delay: number | `${bigint}s` | `${bigint}m` | `${bigint}h` | `${bigint}d`
) {
  const res = await qstashPublishJSON({
    url: `${process.env.NEXT_PUBLIC_URL}/api/send-notification`,
    body: {
      fid,
      title,
      text,
    },
    delay,
  });

  console.log(`[QSTASH-${new Date().toISOString()}]`, res);
}

export function getCropNameFromSeeds(seedType: SeedType) {
  switch (seedType) {
    case "carrot-seeds":
      return "carrots";
    case "pumpkin-seeds":
      return "pumpkin";
    case "tomato-seeds":
      return "tomatoes";
    case "potato-seeds":
      return "potatoes";
    default:
      throw new Error(`Unknown seed type: ${seedType}`);
  }
}

export function getGrowthTime(seedType: SeedType): number {
  const cropType = seedType.replace("-seeds", "");
  const growthTime = GROWTH_TIMES[cropType];
  if (!growthTime) {
    throw new Error(`Unknown seed type: ${seedType}`);
  }
  return growthTime;
}
