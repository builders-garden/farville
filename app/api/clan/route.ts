import { NextRequest, NextResponse } from "next/server";
import {
  createClan,
  getClanById,
  getClans,
  updateClan,
} from "@/lib/prisma/queries";
import { ClanRole } from "@/lib/types/game";
import z from "zod";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const strToSearch = searchParams.get("search") || "";
    const isPublicParam = searchParams.get("isPublic");
    const isPublic =
      isPublicParam === null ? undefined : isPublicParam === "true";

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
  requiredLevel: z.number().int().min(1).optional(),
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

const updateClanSchema = z.object({
  clanId: z.string().min(1, "Clan ID is required"),
  motto: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  imageUrl: z.string().url().nullish(),
  requiredLevel: z.number().int().min(2).max(20).nullish(),
});

export async function PATCH(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = updateClanSchema.parse(body);

    // Get the clan to check permissions
    const clan = await getClanById(parsedData.clanId, { includeMembers: true });

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    // Check if user is leader or officer
    const userMembership = clan.members?.find(
      (member) => member.fid === Number(fid)
    );

    if (!userMembership) {
      return NextResponse.json(
        { error: "You are not a member of this clan" },
        { status: 403 }
      );
    }

    if (
      userMembership.role !== ClanRole.Leader &&
      userMembership.role !== ClanRole.Officer
    ) {
      return NextResponse.json(
        { error: "You don't have permission to edit this clan" },
        { status: 403 }
      );
    }

    // Update the clan with non-null values
    const updateData: {
      motto?: string;
      isPublic?: boolean;
      imageUrl?: string | null;
      requiredLevel?: number | null;
    } = {};

    if (parsedData.motto !== undefined) {
      updateData.motto = parsedData.motto;
    }

    if (parsedData.isPublic !== undefined) {
      updateData.isPublic = parsedData.isPublic;
    }

    if (parsedData.imageUrl !== undefined) {
      updateData.imageUrl = parsedData.imageUrl || null;
    }

    if (parsedData.requiredLevel !== undefined) {
      updateData.requiredLevel = parsedData.requiredLevel;
    }

    const updatedClan = await updateClan(parsedData.clanId, updateData);

    return NextResponse.json(updatedClan);
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
