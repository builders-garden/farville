import { NextRequest } from "next/server";
import { getQuests, getActiveQuests } from "@/supabase/queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get("active") === "true";

    const quests = isActive ? await getActiveQuests() : await getQuests();
    return Response.json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    return Response.json({ error: "Failed to fetch quests" }, { status: 500 });
  }
}
