import { PFP_NFT_TEXT_SYSTEM_PROMPT } from "@/lib/constants";
import { env } from "@/lib/env";
import { updateUserCollectible } from "@/lib/prisma/queries";
import { CollectibleStatus } from "@/lib/types/game";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { imageUrl, fid, collectibleId } = await request.json();

    if (!imageUrl || !fid || !collectibleId) {
      return NextResponse.json({ error: "Invalid arguments" }, { status: 400 });
    }

    console.log("generating description from pfp", imageUrl);
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: PFP_NFT_TEXT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const description = response.choices[0].message.content;

    if (!description) {
      throw new Error("No description generated");
    }

    console.log("saving description to db", description);
    /*
    const res = await updateUserCollectible(fid, collectibleId, {
      status: CollectibleStatus.Description,
      pfpDescription: description,
    });
    */

    return NextResponse.json({
      success: true,
      data: {
        description,
        //userHasCollectible: res,
      },
    });
  } catch (error) {
    console.error("Error generating image description:", error);
    return NextResponse.json(
      { error: "Failed to generate image description" },
      { status: 500 }
    );
  }
}
