import { env } from "@/lib/env";
import Logger from "@/lib/logger";
import { MODE_DEFINITIONS, ModeFeature } from "@/lib/modes/constants";
import { qstashPublishJSON } from "@/lib/qstash";
import { Mode } from "@/lib/types/game";

export async function sendQuestsCalculation(
  fid: number,
  category: string,
  mode: Mode,
  itemId?: number,
  itemAmount?: number
) {
  if (
    env.NEXT_PUBLIC_URL === "http://localhost:3000" ||
    !MODE_DEFINITIONS[mode].features.includes(ModeFeature.Quests)
  ) {
    return;
  }

  const questBody = {
    fid,
    category,
    itemId,
    itemAmount,
    mode,
  };

  const res = await qstashPublishJSON({
    url: `${env.NEXT_PUBLIC_URL}/api/qstash/quest`,
    body: questBody,
  });

  Logger.log(
    `(QSTASH) - sent quest calculation to QStash with id: ${res?.messageId}`
  );
}
