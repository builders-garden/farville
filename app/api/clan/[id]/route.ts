import { getClanById } from "@/lib/prisma/queries";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const clanData = await getClanById(id, {
      includeMembers: true,
    });

    return NextResponse.json(clanData);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("Error fetching clan data:", error);
    return NextResponse.json(
      { error: "Failed to fetch clan data" },
      { status: 500 }
    );
  }
}
