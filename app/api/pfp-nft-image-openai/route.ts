import {
  PFP_NFT_IMAGE_SYSTEM_PROMPT_1,
  PFP_NFT_IMAGE_SYSTEM_PROMPT_2,
} from "@/lib/constants";
import { env } from "@/lib/env";
//import { updateUserCollectible } from "@/lib/prisma/queries";
//import { CollectibleStatus } from "@/lib/types/game";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const replacements = {
  wound: "scar",
  chest: "upper torso",
  blood: "red pigment",
  kill: "defeat",
  bare: "uncovered",
  barefoot: "unshod",
  intimate: "affectionate",
  bleed: "leak",
  unclothed: "uncovered",
};

export async function POST(request: Request) {
  try {
    const { prompt, fid, collectibleId } = await request.json();

    if (!prompt || !fid || !collectibleId) {
      return NextResponse.json({ error: "Invalid arguments" }, { status: 400 });
    }

    let cleanedPrompt = prompt;

    for (const [bannedWord, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${bannedWord}\\b`, "gi");
      cleanedPrompt = cleanedPrompt.replace(regex, replacement);
    }

    console.log("generating description from pfp");
    console.log(
      `${PFP_NFT_IMAGE_SYSTEM_PROMPT_1} ${cleanedPrompt} ${PFP_NFT_IMAGE_SYSTEM_PROMPT_2}`
    );

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `${PFP_NFT_IMAGE_SYSTEM_PROMPT_1} ${cleanedPrompt} ${PFP_NFT_IMAGE_SYSTEM_PROMPT_2}`,
    });

    if (!result) {
      console.error("Error generating image", result);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    console.log("image generated", result);
    // Save the image to a file
    const image_base64 = result.data[0].b64_json;
    if (!image_base64) {
      throw new Error("No base64 image data received");
    }
    const image_bytes = Buffer.from(image_base64, "base64");
    fs.writeFileSync("testt2t.png", image_bytes);

    /*
      const res = await updateUserCollectible(
        parseInt(fid),
        parseInt(collectibleId),
        {
          status: CollectibleStatus.Pending,
          generatedTaskId: data.data.task_id,
        }
      );
      */
    //Return only the taskId to be used in the image-get route
    return NextResponse.json({
      success: true,
      data: {
        //taskId: data.data.task_id,
        //userHasCollectible: res,
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
