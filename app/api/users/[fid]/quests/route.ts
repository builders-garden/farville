import { NextRequest, NextResponse } from "next/server";
import { getUserQuests } from "@/supabase/queries";
import { DbUserHasQuestStatus } from "@/supabase/types";

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

    const quests = await getUserQuests(fid, {
      status: status as DbUserHasQuestStatus,
      category: category || undefined,
      type: type ? [type as "daily" | "weekly" | "monthly"] : undefined,
      itemId: itemId ? parseInt(itemId) : undefined,
    });

    // divide the quests by their type
    const dailyQuests = quests.filter((q) => q.quest.type === "daily");
    const weeklyQuests = quests.filter((q) => q.quest.type === "weekly");
    const monthlyQuests = quests.filter((q) => q.quest.type === "monthly");
    const farmerQuests = quests.filter((q) => !q.quest.type);

    return NextResponse.json({
      daily: dailyQuests,
      weekly: weeklyQuests,
      monthly: monthlyQuests,
      farmer: farmerQuests,
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
