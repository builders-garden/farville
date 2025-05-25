import { Mode, SeedType } from "@/lib/types/game";
import { qstashPublishJSON } from "../qstash";
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
  const isTestMode =
    !!env.NEXT_PUBLIC_IS_TEST_MODE && env.NEXT_PUBLIC_APP_ENV === "development";
  if (env.NEXT_PUBLIC_URL === "http://localhost:3000" || isTestMode) {
    return;
  }
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
