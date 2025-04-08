import {
  MIDJOURNEY_API_URL,
  PFP_NFT_IMAGE_SYSTEM_PROMPT_1,
  PFP_NFT_IMAGE_SYSTEM_PROMPT_2,
} from "@/lib/constants";
import { env } from "@/lib/env";
import { updateUserCollectible } from "@/supabase/queries";
import { CollectibleStatus } from "@/types/game";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, fid, collectibleId } = await request.json();

    if (!prompt || !fid || !collectibleId) {
      return NextResponse.json({ error: "Invalid arguments" }, { status: 400 });
    }

    const response = await fetch(MIDJOURNEY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.MIDJOURNEY_API_KEY,
      },
      body: JSON.stringify({
        model: "midjourney",
        task_type: "imagine",
        config: {
          service_mode: "private",
        },
        input: {
          prompt: `${PFP_NFT_IMAGE_SYSTEM_PROMPT_1} ${prompt} ${PFP_NFT_IMAGE_SYSTEM_PROMPT_2} --v 6.1 --style raw --stylize 100`,
          aspect_ratio: "1:1",
          process_mode: "turbo",
          skip_prompt_check: false,
        },
      }),
    });

    if (!response.ok) {
      console.error("Error generating image");
      throw new Error("Failed to generate image");
    }

    const data = await response.json();

    // save taskId to db
    console.log("saving taskId to db", data.data.task_id);
    const res = await updateUserCollectible(
      parseInt(fid),
      parseInt(collectibleId),
      {
        status: CollectibleStatus.Pending,
        generatedTaskId: data.data.task_id,
      }
    );
    //Return only the taskId to be used in the image-get route
    return NextResponse.json({
      success: true,
      data: {
        taskId: data.data.task_id,
        userHasCollectible: res,
      },
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
