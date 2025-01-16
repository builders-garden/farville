import { NextRequest, NextResponse } from "next/server";
import { createRequest, getItemById } from "@/supabase/queries";
import { trackEvent } from "@/lib/posthog/server";

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

  const item = await getItemById(itemId);

  if (!item) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404 }
    );
  }

  try {
    const newRequest = await createRequest({
      fid: Number(fid),
      itemId,
      quantity,
    });
    trackEvent(Number(fid), "created-request", {
      itemId: itemId,
      itemSlug: item.slug,
      quantity: quantity,
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
