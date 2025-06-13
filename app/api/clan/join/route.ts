import {
  createClanMembership,
  deleteClanMembership,
  getClanById,
  createClanJoinRequest,
  getClanJoinRequestByUserAndClan,
  deleteClanRequestsByFid,
  deleteClan,
} from "@/lib/prisma/queries";
import {
  updateClanMembership,
  getClanByFid,
} from "@/lib/prisma/queries/clan-membership";
import { deleteAllClanJoinRequestsByFid } from "@/lib/prisma/queries/clan-join-request-utils";
import { ClanRole } from "@/lib/types/game";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const joinClanSchema = z.object({
  clanId: z.string().min(1, "Clan ID is required"),
  isPublic: z.boolean().optional(),
  userLevel: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsedData = joinClanSchema.parse(body);
    const { clanId, userLevel } = parsedData;

    // Fetch the clan to double check its visibility
    const clan = await getClanById(clanId, {});

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    // Use the clan's actual isPublic status for security
    const clanIsPublic = clan.isPublic;

    // Check if the user meets the level requirement (if the clan has one)
    if (clan.requiredLevel && userLevel && userLevel < clan.requiredLevel) {
      return NextResponse.json(
        {
          error: `You need to be level ${clan.requiredLevel} to join this clan`,
        },
        { status: 403 }
      );
    }

    if (clanIsPublic) {
      // For public clans, create membership immediately
      const membership = await createClanMembership(clanId, Number(fid));

      // Delete all other pending join requests from this user
      await deleteAllClanJoinRequestsByFid(Number(fid));

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
    // Check if there's a request body for leader succession
    let body = null;
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // No body or invalid JSON, proceed without succession
    }

    const successorFid = body?.successorFid;

    // Get user's current clan membership to check if they're a leader
    const userClan = await getClanByFid(Number(fid));

    if (!userClan) {
      return NextResponse.json(
        { error: "You are not in a clan" },
        { status: 400 }
      );
    }

    const isLeader = userClan.role === ClanRole.Leader;

    const promises: Promise<unknown>[] = [
      // Remove the user from the clan
      deleteClanMembership(Number(fid)),
      // Remove user requests from the clan
      deleteClanRequestsByFid(userClan.clanId, Number(fid)),
    ];

    // If user is a leader and no successor is provided, check if there are other members
    if (isLeader && !successorFid) {
      const clanData = await getClanById(userClan.clanId, {
        includeMembers: true,
      });
      const otherMembers =
        clanData?.members?.filter((m) => m.fid !== Number(fid)) || [];

      if (otherMembers.length > 0) {
        return NextResponse.json(
          {
            error:
              "As a leader, you must select a successor before leaving the clan",
            requiresSuccessor: true,
            members: otherMembers,
          },
          { status: 400 }
        );
      }

      promises.push(
        // If no successor and no other members, delete the clan
        deleteClan(userClan.clanId)
      );
    }

    // If a successor is provided, promote them to leader
    if (successorFid && isLeader) {
      promises.push(updateClanMembership(successorFid, ClanRole.Leader));
    }

    await Promise.all(promises);

    const message = successorFid
      ? "Left clan successfully and transferred leadership"
      : "Left clan successfully";

    return NextResponse.json({ message });
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
