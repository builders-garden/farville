import { NextRequest, NextResponse } from "next/server";
import { createRequest } from "@/supabase/queries";

export const POST = async (request: NextRequest) => {
  const { itemId, quantity } = await request.json();
  const fid = request.headers.get("x-user-fid");

  if (!fid) {
    return NextResponse.json(
      { error: "Farcaster ID is required" },
      { status: 400 }
    );
  }

  if (!itemId || !quantity) {
    return NextResponse.json(
      { error: "Item ID and quantity are required" },
      { status: 400 }
    );
  }

  try {
    const newRequest = await createRequest({
      fid: Number(fid),
      itemId,
      quantity,
    });

    return NextResponse.json(newRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
};
