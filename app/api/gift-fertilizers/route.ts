import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Mode, PerkType } from "@/lib/types/game";
import {
  addUserItem,
  getItemBySlug,
  getUsersByMode,
} from "@/lib/prisma/queries";

const requestSchema = z.object({
  fid: z.number().min(1),
  mode: z.nativeEnum(Mode).default(Mode.Classic),
});

export const POST = async (req: NextRequest) => {
  try {
    const requestJson = await req.json();
    const requestBody = requestSchema.safeParse(requestJson);

    if (requestBody.success === false) {
      return NextResponse.json(
        { error: requestBody.error.errors },
        { status: 400 }
      );
    }

    const { mode } = requestBody.data;

    // Get fertilizer item
    const fertilizer = await getItemBySlug(PerkType.Fertilizer);
    if (!fertilizer) {
      return NextResponse.json(
        { error: "Fertilizer item not found" },
        { status: 404 }
      );
    }

    // Get all users
    const users = await getUsersByMode(mode);
    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    // Distribute fertilizers to all users
    const promises = users.map((user) =>
      addUserItem(user.fid, fertilizer.id, 1, mode)
    );

    await Promise.all(promises);

    return NextResponse.json(
      { message: "Fertilizers distributed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error distributing fertilizers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
