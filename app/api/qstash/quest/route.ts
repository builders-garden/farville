import { NextRequest } from "next/server";
import { z } from "zod";
import { calculateUserQuestsProgress } from "./utils";

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
    const updatedQuests = await calculateUserQuestsProgress(
      fid,
      category,
      itemId,
      itemAmount
    );

    console.log(
      `[${new Date().toISOString()}] updated ${
        updatedQuests?.length
      } quests for user ${fid}`
    );

    return Response.json({
      success: true,
      quests: updatedQuests,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] error updating quests for user ${fid}`,
      error
    );

    return Response.json(
      { success: false, error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
