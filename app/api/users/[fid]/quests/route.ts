import { NextRequest, NextResponse } from "next/server";
import { DbUserHasQuestStatus } from "@/supabase/types";
import { QuestType } from "@/lib/types/game";
import { getUserHasQuests } from "@/lib/prisma/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid: stringFid } = await params; // keep this await
    const fid = parseInt(stringFid);
    if (isNaN(fid)) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const itemId = searchParams.get("itemId");
    const activeToday = searchParams.get("activeToday");

    const quests = await getUserHasQuests(
      fid,
      {
        status: status as DbUserHasQuestStatus,
        category: category || undefined,
        type: type ? [type as QuestType] : undefined,
        itemId: itemId ? parseInt(itemId) : undefined,
        activeToday: activeToday === "true",
      },
      {
        quest: true,
        item: true,
      }
    );

    // divide the quests by their type
    const dailyQuests = quests.filter((q) => q.quest.type === "daily");
    const weeklyQuests = quests.filter((q) => q.quest.type === "weekly");

    return NextResponse.json({
      daily: dailyQuests,
      weekly: weeklyQuests,
    });
  } catch (error) {
    console.error("Error fetching user quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch user quests" },
      { status: 500 }
    );
  }
}

// not used in the app - just for reference
// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ fid: string }> }
// ) {
//   try {
//     const { fid } = await params;
//     if (isNaN(Number(fid))) {
//       return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
//     }

//     const questData: Omit<InsertDbUserHasQuest, "fid"> = await request.json();
//     const userQuest = await createUserQuest({
//       ...questData,
//       fid: Number(fid),
//     });

//     return NextResponse.json(userQuest, { status: 201 });
//   } catch (error) {
//     console.error("Error creating user quest:", error);
//     return NextResponse.json(
//       { error: "Failed to create user quest" },
//       { status: 500 }
//     );
//   }
// }
