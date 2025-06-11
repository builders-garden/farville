import { NextRequest, NextResponse } from "next/server";
import { getClanById } from "@/lib/prisma/queries";
import {
  deleteClanMembership,
  updateClanMembership,
} from "@/lib/prisma/queries/clan-membership";
import { prisma } from "@/lib/prisma/client";
import { ClanRole } from "@/lib/types/game";
import z from "zod";

const memberActionSchema = z.object({
  action: z.enum(["promote", "demote", "kick", "promote_to_leader"]),
  clanId: z.string().min(1, "Clan ID is required"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  const userFid = req.headers.get("x-user-fid");
  if (!userFid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const targetFid = Number(resolvedParams.fid);
    const body = await req.json();
    const { action, clanId } = memberActionSchema.parse(body);

    // Get the clan to check permissions
    const clan = await getClanById(clanId, { includeMembers: true });

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    // Find the current user's membership
    const currentUserMembership = clan.members?.find(
      (member) => member.fid === Number(userFid)
    );

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "You are not a member of this clan" },
        { status: 403 }
      );
    }

    // Find the target member
    const targetMembership = clan.members?.find(
      (member) => member.fid === targetFid
    );

    if (!targetMembership) {
      return NextResponse.json(
        { error: "Target member not found in clan" },
        { status: 404 }
      );
    }

    // Check permissions based on action
    if (action === "kick") {
      // Only leaders and officers can kick members
      // Leaders can kick officers and members
      // Officers can only kick members
      if (currentUserMembership.role === ClanRole.Member) {
        return NextResponse.json(
          { error: "You don't have permission to kick members" },
          { status: 403 }
        );
      }

      if (
        currentUserMembership.role === ClanRole.Officer &&
        targetMembership.role !== ClanRole.Member
      ) {
        return NextResponse.json(
          { error: "Officers can only kick regular members" },
          { status: 403 }
        );
      }

      // Cannot kick yourself
      if (targetFid === Number(userFid)) {
        return NextResponse.json(
          { error: "You cannot kick yourself" },
          { status: 400 }
        );
      }

      // Delete the membership
      await deleteClanMembership(targetFid);

      return NextResponse.json({
        success: true,
        message: "Member kicked successfully",
      });
    } else if (action === "promote") {
      // Only leaders can promote
      if (currentUserMembership.role !== ClanRole.Leader) {
        return NextResponse.json(
          { error: "Only leaders can promote members" },
          { status: 403 }
        );
      }

      // Can only promote members to officers
      if (targetMembership.role !== ClanRole.Member) {
        return NextResponse.json(
          { error: "Can only promote regular members to officers" },
          { status: 400 }
        );
      }

      // Update the role
      await updateClanMembership(targetFid, ClanRole.Officer);

      return NextResponse.json({
        success: true,
        message: "Member promoted to officer",
      });
    } else if (action === "demote") {
      // Only leaders can demote
      if (currentUserMembership.role !== ClanRole.Leader) {
        return NextResponse.json(
          { error: "Only leaders can demote members" },
          { status: 403 }
        );
      }

      // Can only demote officers to members
      if (targetMembership.role !== ClanRole.Officer) {
        return NextResponse.json(
          { error: "Can only demote officers to regular members" },
          { status: 400 }
        );
      }

      // Update the role
      await updateClanMembership(targetFid, ClanRole.Member);

      return NextResponse.json({
        success: true,
        message: "Officer demoted to member",
      });
    } else if (action === "promote_to_leader") {
      // Only leaders can promote others to leader
      if (currentUserMembership.role !== ClanRole.Leader) {
        return NextResponse.json(
          { error: "Only leaders can promote others to leader" },
          { status: 403 }
        );
      }

      // Can only promote officers to leader
      if (targetMembership.role !== ClanRole.Officer) {
        return NextResponse.json(
          { error: "Can only promote officers to leader" },
          { status: 400 }
        );
      }

      // Cannot promote yourself
      if (targetFid === Number(userFid)) {
        return NextResponse.json(
          { error: "You cannot promote yourself to leader" },
          { status: 400 }
        );
      }

      // Transfer leadership: promote target to leader and demote current leader to officer
      await updateClanMembership(targetFid, ClanRole.Leader);
      await updateClanMembership(Number(userFid), ClanRole.Officer);

      // Also update the clan's leaderFid field
      await prisma.clan.update({
        where: { id: clanId },
        data: { leaderFid: targetFid },
      });

      return NextResponse.json({
        success: true,
        message: "Leadership transferred successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    console.error("Error managing clan member:", error);
    return NextResponse.json(
      { error: "Failed to perform member action" },
      { status: 500 }
    );
  }
}
