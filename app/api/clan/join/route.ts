import {
  createClanMembership,
  deleteClanMembership,
} from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const joinClanSchema = z.object({
  clanId: z.string().min(1, "Clan ID is required"),
});

export async function POST(req: NextRequest) {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsedData = joinClanSchema.parse(body);
    const { clanId } = parsedData;

    const membership = await createClanMembership(clanId, Number(fid));
    return NextResponse.json(membership);
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

    console.error("Error joining clan:", error);
    return NextResponse.json({ error: "Failed to join clan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await deleteClanMembership(Number(fid));

    return NextResponse.json({ message: "Left clan successfully" });
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

    console.error("Error leaving clan:", error);
    return NextResponse.json(
      { error: "Failed to leave clan" },
      { status: 500 }
    );
  }
}
