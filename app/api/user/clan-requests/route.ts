import { NextRequest, NextResponse } from "next/server";
import { getOutgoingClanJoinRequestsByFid } from "@/lib/prisma/queries";

export async function GET(req: NextRequest) {
  const fid = req.headers.get("x-user-fid");

  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await getOutgoingClanJoinRequestsByFid(Number(fid));

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching outgoing clan requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch outgoing clan requests" },
      { status: 500 }
    );
  }
}
