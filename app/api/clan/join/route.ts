import {
  createClanMembership,
  deleteClanMembership,
  getClanById,
  createClanJoinRequest,
  getClanJoinRequestByUserAndClan,
} from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const joinClanSchema = z.object({
  clanId: z.string().min(1, "Clan ID is required"),
  isPublic: z.boolean().optional(),
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

    // Fetch the clan to double check its visibility
    const clan = await getClanById(clanId, {});

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    // Use the clan's actual isPublic status for security
    const clanIsPublic = clan.isPublic;

    if (clanIsPublic) {
      // For public clans, create membership immediately
      const membership = await createClanMembership(clanId, Number(fid));
      return NextResponse.json({
        success: true,
        message: "Joined clan successfully",
        ...membership,
      });
    } else {
      // For private clans, check if a request already exists
      const existingRequest = await getClanJoinRequestByUserAndClan(
        Number(fid),
        clanId
      );

      if (existingRequest) {
        return NextResponse.json({
          success: true,
          message: "Join request already exists",
          ...existingRequest,
        });
      }

      // Create a join request
      const joinRequest = await createClanJoinRequest(clanId, Number(fid));
      return NextResponse.json({
        success: true,
        message: "Join request sent",
        ...joinRequest,
      });
    }
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
