import { createClanRequest } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const createClanRequestSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  clanId: z.string().min(1, "Clan ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = createClanRequestSchema.parse(body);

    const { requestId, clanId } = parsedData;

    await createClanRequest(requestId, clanId);

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
