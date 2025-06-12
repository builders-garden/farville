import { createClanRequest } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const createClanRequestSchema = z.object({
  requestId: z.string().min(1, "Request ID is required").optional(),
  clanId: z.string().min(1, "Clan ID is required"),
  itemId: z.number().min(1).optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = createClanRequestSchema.parse(body);

    const { requestId, clanId, itemId, quantity } = parsedData;

    // if requestId is not provided, itemId and quantity must be provided
    if (!requestId && (!itemId || !quantity)) {
      return NextResponse.json(
        {
          error:
            "If requestId is not provided, itemId and quantity are required",
        },
        { status: 400 }
      );
    }

    console.log("Creating clan request with data:", {
      requestId,
      clanId,
      itemId,
      quantity,
      fid: Number(fid),
    });

    await createClanRequest({
      requestId,
      clanId,
      itemId,
      quantity,
      fid: Number(fid),
    });

    return NextResponse.json(
      {
        status: "success",
        message: `Request ${requestId} shared to clan ${clanId} successfully.`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
