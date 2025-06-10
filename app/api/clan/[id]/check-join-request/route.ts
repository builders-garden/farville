import { getClanJoinRequestByUserAndClan } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { clanId: string } }
) {
  const fid = req.headers.get("x-user-fid");
  const { clanId } = params;

  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the user already has a pending join request for this clan
    const existingRequest = await getClanJoinRequestByUserAndClan(
      Number(fid),
      clanId
    );

    return NextResponse.json({
      hasPendingRequest: !!existingRequest,
      requestId: existingRequest?.id,
    });
  } catch (error) {
    console.error("Error checking join request:", error);
    return NextResponse.json(
      { error: "Failed to check join request status" },
      { status: 500 }
    );
  }
}
