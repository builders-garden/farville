import { getQuests } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const quests = await getQuests();
    return NextResponse.json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch quests" },
      { status: 500 }
    );
  }
}
