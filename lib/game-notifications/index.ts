import { Mode, SeedType } from "@/lib/types/game";
import { env } from "@/lib/env";
import axios from "axios";

export async function sendDelayedNotificationToService(
  fid: number,
  title: string,
  text: string,
  category: string,
  mode: Mode,
  delay?: number
) {
  // const isTestMode =
  //   !!env.NEXT_PUBLIC_IS_TEST_MODE && env.NEXT_PUBLIC_APP_ENV === "development";
  // if (env.NEXT_PUBLIC_URL === "http://localhost:3000" || isTestMode) {
  //   return;
  // }

  await axios({
    url: `${env.FARVILLE_SERVICE_URL}/api/async-jobs/notifications/schedule`,
    method: "post",
    headers: {
      "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
    },
    data: {
      fid,
      title,
      text,
      category,
      mode,
      delay: delay && delay > 0 ? delay : 0, // default to 0 if no delay is provided
    },
  });
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
