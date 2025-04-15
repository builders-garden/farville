import { MIDJOURNEY_API_URL } from "@/lib/constants";
import { env } from "@/lib/env";
import { updateUserCollectible } from "@/supabase/queries";
import { CollectibleStatus } from "@/lib/types/game";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { taskId, fid, collectibleId } = await request.json();

    if (!taskId || !fid || !collectibleId) {
      return NextResponse.json({ error: "Invalid arguments" }, { status: 400 });
    }

    const response = await fetch(`${MIDJOURNEY_API_URL}/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.MIDJOURNEY_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get task status");
    }

    const data = await response.json();

    if (data.data.output.image_url) {
      console.log("saving imageUrl to db", data.data.output.image_url);
      const res = await updateUserCollectible(
        parseInt(fid),
        parseInt(collectibleId),
        {
          status: CollectibleStatus.Generated,
          generatedImageUrls: [
            data.data.output.image_url,
            ...data.data.output.temporary_image_urls,
          ],
        }
      );

      return NextResponse.json({
        success: true,
        data: {
          status: data.data.status,
          imageUrl: data.data.output.image_url,
          imageUrls: data.data.output.temporary_image_urls,
          userHasCollectible: res,
        },
      });
    } else {
      console.log("still generating image", data.data.status);
      return NextResponse.json({
        status: data.data.status,
        imageUrl: null,
        imageUrls: null,
      });
    }
  } catch (error) {
    console.error("Error getting task status:", error);
    return NextResponse.json(
      { error: "Failed to get task status" },
      { status: 500 }
    );
  }
}
