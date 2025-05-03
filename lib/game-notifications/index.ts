import { Mode, SeedType } from "@/lib/types/game";
import { qstashPublishJSON } from "../qstash";
import { CROP_DATA } from "@/lib/game-constants";
import { env } from "@/lib/env";
import Logger from "../logger";

export async function sendDelayedNotification(
  fid: string,
  title: string,
  text: string,
  category: string,
  mode: Mode,
  delay?: number | `${bigint}s` | `${bigint}m` | `${bigint}h` | `${bigint}d`
) {
  // disable notifications
  // if (env.NEXT_PUBLIC_URL === "http://localhost:3000") {
  return;
  // }
  const res = await qstashPublishJSON({
    url: `${env.NEXT_PUBLIC_URL}/api/qstash/send-notification`,
    body: {
      fid: fid.toString(),
      title,
      text,
      category,
      mode,
    },
    delay,
  });

  Logger.log(
    `(QSTASH) - sent delayed notification to QStash with id: ${res?.messageId}`
  );
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
    case "wheat-seeds":
      return "wheat";
    case "corn-seeds":
      return "corn";
    case "lettuce-seeds":
      return "lettuce";
    case "eggplant-seeds":
      return "eggplant";
    case "radish-seeds":
      return "radishes";
    case "strawberry-seeds":
      return "strawberries";
    case "watermelon-seeds":
      return "watermelon";
    default:
      throw new Error(`Unknown seed type: ${seedType}`);
  }
}

function formatMillisecondsToTimeUnit(
  ms: number
): `${bigint}s` | `${bigint}m` | `${bigint}h` | `${bigint}d` {
  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (days >= 1) return `${BigInt(Math.floor(days))}d`;
  if (hours >= 1) return `${BigInt(Math.floor(hours))}h`;
  if (minutes >= 1) return `${BigInt(Math.floor(minutes))}m`;
  return `${BigInt(Math.floor(seconds))}s`;
}

export function getGrowthTime(
  seedType: SeedType
): `${bigint}s` | `${bigint}m` | `${bigint}h` | `${bigint}d` {
  const cropType = seedType.replace("-seeds", "");
  const cropData = CROP_DATA[cropType];
  if (!cropData) {
    throw new Error(`Unknown seed type: ${seedType}`);
  }
  return formatMillisecondsToTimeUnit(cropData.growthTime);
}
