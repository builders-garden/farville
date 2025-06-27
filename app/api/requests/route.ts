import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GAME_ITEMS } from "@/lib/game-constants";
import { createRequest, getItemById } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { withTracing } from "@/lib/otel/traceWrapper";

const requestSchema = z.object({
  itemId: z.number().min(1),
  quantity: z.number().min(1).max(10),
  mode: z.nativeEnum(Mode),
});

const handlerPOST = async (request: NextRequest) => {
  const requestJson = await request.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { itemId, quantity, mode } = requestBody.data;
  const fid = request.headers.get("x-user-fid");

  if (!fid) {
    return NextResponse.json(
      { error: "Farcaster ID is required" },
      { status: 400 }
    );
  }

  const validItem = GAME_ITEMS.find(
    (item) =>
      item.id === itemId &&
      (item.category === "seed" || item.category === "crop")
  );

  if (!validItem) {
    return NextResponse.json(
      { error: "Invalid item: Only seeds and crops can be requested" },
      { status: 400 }
    );
  }

  const item = await getItemById(itemId);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  try {
    const newRequest = await createRequest({
      quantity,
      itemId,
      fid: parseInt(fid),
      mode,
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

export const POST = withTracing(handlerPOST);
