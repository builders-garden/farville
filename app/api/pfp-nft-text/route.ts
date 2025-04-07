import { PFP_NFT_TEXT_SYSTEM_PROMPT } from "@/lib/constants";
import { env } from "@/lib/env";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

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

    console.log("returning description", description);
    return NextResponse.json({
      success: true,
      data: { description },
    });
  } catch (error) {
    console.error("Error generating image description:", error);
    return NextResponse.json(
      { error: "Failed to generate image description" },
      { status: 500 }
    );
  }
}
