import z from "zod";
import { NextResponse } from "next/server";
import axios from "axios";
import { env } from "@/lib/env";
import { TitlesResponse } from "@/lib/types/titles";
import { TITLES_BASE_URL } from "../utils";
import {
  PFP_NFT_IMAGE_SYSTEM_PROMPT_1,
  PFP_NFT_IMAGE_SYSTEM_PROMPT_2,
} from "@/lib/constants";
import {
  getUserCollectibleByCollectibleId,
  updateUserCollectible,
} from "@/lib/prisma/queries";
import { CollectibleStatus } from "@/lib/types/game";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  collectibleId: z
    .number()
    .int()
    .positive("Collectible ID must be a positive integer"),
});

export async function POST(request: Request) {
  try {
    const fid = request.headers.get("x-user-fid");

    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedBody = requestSchema.parse(body);

    const { prompt, collectibleId } = parsedBody;

    // before sending to Titles check that the image request is valid
    const userHasCollectible = await getUserCollectibleByCollectibleId(
      Number(fid),
      collectibleId
    );

    if (
      !userHasCollectible ||
      userHasCollectible.status !== CollectibleStatus.Description
    ) {
      return NextResponse.json(
        { error: "Invalid collectible or not in the correct state" },
        { status: 400 }
      );
    }

    const titlesResult = await axios<TitlesResponse>({
      url: `${TITLES_BASE_URL}/api/v1/inference/text-to-image`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-TITLES-Key": env.TITLES_API_KEY,
      },
      data: {
        prompt: `${PFP_NFT_IMAGE_SYSTEM_PROMPT_1} ${prompt} ${PFP_NFT_IMAGE_SYSTEM_PROMPT_2}`,
        model_id: env.TITLES_MODEL_ID,
        aspect_ratio: "1:1",
      },
    });

    // save taskId to db
    const res = await updateUserCollectible(Number(fid), collectibleId, {
      status: CollectibleStatus.Pending,
      generatedTaskId: titlesResult.data.inference_id,
    });

    return NextResponse.json({
      success: true,
      data: {
        inferenceId: titlesResult.data.inference_id,
        userHasCollectible: res,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
