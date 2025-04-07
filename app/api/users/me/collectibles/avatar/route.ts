import { NextRequest, NextResponse } from "next/server";
import { updateUserCollectibleAsAvatar } from "@/supabase/queries";

export async function POST(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");
    if (!fid || isNaN(Number(fid))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collectibleId } = await req.json();
    if (isNaN(Number(collectibleId))) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const newUser = await updateUserCollectibleAsAvatar(
      Number(fid),
      Number(collectibleId)
    );
    if (!newUser) {
      return NextResponse.json(
        { error: "Collectible not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.error("Error setting collectible as avatar:", error);
    return NextResponse.json(
      { error: "Failed to set collectible as avatar" },
      { status: 500 }
    );
  }
}
