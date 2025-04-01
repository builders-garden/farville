import { MIDJOURNEY_API_URL } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${MIDJOURNEY_API_URL}/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MIDJOURNEY_API_KEY || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get task status");
    }

    const data = await response.json();
    return NextResponse.json({
      status: data.data.status,
      imageUrl: data.data.output.image_url,
      imageUrls: data.data.output.temporary_image_urls,
    });
  } catch (error) {
    console.error("Error getting task status:", error);
    return NextResponse.json(
      { error: "Failed to get task status" },
      { status: 500 }
    );
  }
}
