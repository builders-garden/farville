import { MIDJOURNEY_API_URL, PFP_NFT_IMAGE_SYSTEM_PROMPT_1, PFP_NFT_IMAGE_SYSTEM_PROMPT_2 } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await fetch(MIDJOURNEY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MIDJOURNEY_API_KEY || "",
      },
      body: JSON.stringify({
        model: "midjourney",
        task_type: "imagine",
        input: {
          prompt: `${PFP_NFT_IMAGE_SYSTEM_PROMPT_1} ${prompt} ${PFP_NFT_IMAGE_SYSTEM_PROMPT_2}`,
          aspect_ratio: "1:1",
          process_mode: "turbo",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate image");
    }

    const data = await response.json();
    //Return only the taskId to be used in the image-get route
    return NextResponse.json({ taskId: data.data.task_id });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
