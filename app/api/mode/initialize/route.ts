import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Mode } from "@/lib/types/game";
import {
  createUserStatistic,
  getUser,
  getUserByMode,
  giftStarterPack,
  initializeGrid,
} from "@/lib/prisma/queries";

const requestSchema = z.object({
  mode: z.nativeEnum(Mode),
});

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { error: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { mode } = requestBody.data;

  try {
    // check if user is already initialized for the given mode
    const user = await getUserByMode(Number(fid), mode);

    if (user) {
      return NextResponse.json(
        { error: `User already initialized for mode ${mode}` },
        { status: 400 }
      );
    }

    // check if the user exists
    const userExists = await getUser(Number(fid));
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // create user statistic
    await createUserStatistic(Number(fid), mode);
    // create new user grid for the given mode
    await initializeGrid(Number(fid), mode);
    await giftStarterPack(Number(fid), mode);

    return NextResponse.json(
      { message: `User initialized for mode ${mode}` },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
