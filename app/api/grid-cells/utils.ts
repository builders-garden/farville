import { env } from "@/lib/env";
import Logger from "@/lib/logger";
import { qstashPublishJSON } from "@/lib/qstash";

export async function sendQuestsCalculation(
  fid: number,
  category: string,
  itemId?: number,
  itemAmount?: number
) {
  if (env.NEXT_PUBLIC_URL === "http://localhost:3000") {
    return;
  }

  const questBody = {
    fid,
    category,
    itemId,
    itemAmount,
  };

  const res = await qstashPublishJSON({
    url: `${env.NEXT_PUBLIC_URL}/api/qstash/quest`,
    body: questBody,
  });

  Logger.log(
    `(QSTASH) - sent quest calculation to QStash with id: ${res?.messageId}`
  );
}
