import { NextRequest, NextResponse } from "next/server";
import { createClan, getClans } from "@/lib/prisma/queries";
import z from "zod";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const strToSearch = searchParams.get("search") || "";
    const isPublicParam = searchParams.get("isPublic");
    const isPublic = isPublicParam === null ? true : isPublicParam === "true";

    const clans = await getClans({ strToSearch, isPublic });
    return NextResponse.json(clans);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

const createClanSchema = z.object({
  name: z.string().min(3).max(50),
  motto: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  txHash: z.string().max(66).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = createClanSchema.parse(body);

    // Assuming you have a function to create a clan
    const clan = await createClan({
      ...parsedData,
      createdBy: Number(fid),
      leaderFid: Number(fid), // For the first step, let's assume the creator is the leader
    });

    return NextResponse.json(clan, { status: 201 });
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
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
