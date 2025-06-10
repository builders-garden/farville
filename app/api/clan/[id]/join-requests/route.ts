import {
  getClanById,
  createClanMembership,
  deleteClanJoinRequest,
  getClanJoinRequestsByClanId,
} from "@/lib/prisma/queries";
import { deleteAllClanJoinRequestsByFid } from "@/lib/prisma/queries/clan-join-request-utils";
import { prisma } from "@/lib/prisma/client";
import { ClanRole } from "@/lib/types/game";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// For getting join requests for a clan
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const clanId = resolvedParams.id;

    console.log("Fetching join requests for clan:", clanId);

    // Verify the user is a leader or officer of the clan
    const clan = await getClanById(clanId, { includeMembers: true });

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    // Make sure the user is a leader or officer
    const userMembership = clan.members?.find(
      (member) => member.fid === Number(fid)
    );
    if (
      !userMembership ||
      (userMembership.role !== ClanRole.Leader &&
        userMembership.role !== ClanRole.Officer)
    ) {
      return NextResponse.json(
        { error: "You don't have permission to view join requests" },
        { status: 403 }
      );
    }

    // Get all join requests for the clan
    const joinRequests = await getClanJoinRequestsByClanId(clanId);

    return NextResponse.json(joinRequests);
  } catch (error) {
    console.error("Error fetching clan join requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch clan join requests" },
      { status: 500 }
    );
  }
}

// For accepting or rejecting join requests
const actionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(["accept", "reject"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const clanId = resolvedParams.id;
    const body = await req.json();
    const { requestId, action } = actionSchema.parse(body);

    // Verify the user is a leader or officer of the clan
    const clan = await getClanById(clanId, { includeMembers: true });

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    // Make sure the user is a leader or officer
    const userMembership = clan.members?.find(
      (member) => member.fid === Number(fid)
    );
    if (
      !userMembership ||
      (userMembership.role !== ClanRole.Leader &&
        userMembership.role !== ClanRole.Officer)
    ) {
      return NextResponse.json(
        { error: "You don't have permission to manage join requests" },
        { status: 403 }
      );
    }

    // Get the request to get the user's FID
    const joinRequest = await prisma.clanJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { error: "Join request not found" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // Create membership
      await createClanMembership(clanId, joinRequest.fid);

      // Delete all pending join requests from this user to cancel other clan requests
      await deleteAllClanJoinRequestsByFid(joinRequest.fid);

      return NextResponse.json({
        success: true,
        message: "User accepted into clan",
      });
    } else {
      // Just delete the request
      await deleteClanJoinRequest(requestId);

      return NextResponse.json({
        success: true,
        message: "Join request rejected",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    console.error("Error managing clan join request:", error);
    return NextResponse.json(
      { error: "Failed to process join request" },
      { status: 500 }
    );
  }
}
