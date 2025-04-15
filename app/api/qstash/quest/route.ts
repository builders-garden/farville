import { NextRequest } from "next/server";
import { z } from "zod";
import { calculateUserQuestsProgress } from "./utils";
import Logger from "@/lib/logger";

const requestSchema = z.object({
  fid: z.number().min(1),
  category: z.string().min(1),
  itemId: z.number().optional(),
  itemAmount: z.number().default(1),
});

export async function POST(req: NextRequest) {
  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { fid, category, itemId, itemAmount } = requestBody.data;

  try {
    Logger.log(
      `calculating quests for user ${fid} with data: category="${category}", itemId=${itemId}, amount=${itemAmount}`
    );
    const updatedQuests = await calculateUserQuestsProgress(
      fid,
      category,
      itemId,
      itemAmount
    );

    if (updatedQuests.length === 0) {
      Logger.log(
        `no quests updated for user ${fid} with data: category="${category}", itemId=${itemId}, amount=${itemAmount}`
      );
    } else {
      Logger.log(
        `qstash call updated ${updatedQuests?.length} quests (${updatedQuests
          ?.map((q) => q.questId)
          .join(
            ", "
          )}) for user ${fid} with data: category="${category}", itemId=${itemId}, amount=${itemAmount}`
      );
    }

    return Response.json({
      success: true,
      quests: updatedQuests,
    });
  } catch (error) {
    Logger.error(
      `error updating quests for user ${fid} with data: category="${category}", itemId=${itemId}, amount=${itemAmount} - ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );

    return Response.json(
      { success: false, error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
