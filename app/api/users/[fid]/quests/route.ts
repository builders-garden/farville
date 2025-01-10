import { NextRequest, NextResponse } from "next/server";
import {
  getUserQuests,
  createUserQuest,
  getActiveUserQuests,
} from "@/supabase/queries";
import { InsertDbUserHasQuest } from "@/supabase/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const { fid: stringFid } = await params; // keep this await
    const fid = parseInt(stringFid);
    if (isNaN(fid)) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active") === "true";

    const quests = active
      ? await getActiveUserQuests(fid)
      : await getUserQuests(fid, active);

    return NextResponse.json(quests);
  } catch (error) {
    console.error("Error fetching user quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch user quests" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const fid = parseInt(params.fid);
    if (isNaN(fid)) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const questData: Omit<InsertDbUserHasQuest, "fid"> = await request.json();
    const userQuest = await createUserQuest({
      ...questData,
      fid,
    });

    return NextResponse.json(userQuest, { status: 201 });
  } catch (error) {
    console.error("Error creating user quest:", error);
    return NextResponse.json(
      { error: "Failed to create user quest" },
      { status: 500 }
    );
  }
}
