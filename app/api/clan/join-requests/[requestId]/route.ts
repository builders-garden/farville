import { NextRequest, NextResponse } from "next/server";
import {
  deleteClanJoinRequestById,
  getClanJoinRequestById,
} from "@/lib/prisma/queries";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const fid = req.headers.get("x-user-fid");
  const { requestId } = await params;

  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify the request belongs to the user
    const request = await getClanJoinRequestById(requestId);

    if (!request) {
      return NextResponse.json(
        { error: "Join request not found" },
        { status: 404 }
      );
    }

    if (request.fid !== Number(fid)) {
      return NextResponse.json(
        { error: "You can only cancel your own join requests" },
        { status: 403 }
      );
    }

    // Delete the request
    await deleteClanJoinRequestById(requestId);

    return NextResponse.json({
      success: true,
      message: "Join request cancelled",
    });
  } catch (error) {
    console.error("Error cancelling join request:", error);
    return NextResponse.json(
      { error: "Failed to cancel join request" },
      { status: 500 }
    );
  }
}
