import { NextRequest, NextResponse } from "next/server";
import { fertilize, harvest, plantSeed } from "./utils";

export async function POST(
  req: NextRequest,
  context: { params: { x: string; y: string } }
) {
  // Await the params
  const { x, y } = await Promise.resolve(context.params);
  const { action, seedType } = await req.json();

  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let result: { rewards?: { xp: number; amount: number } } | null = null;

  switch (action) {
    case "plant":
      await plantSeed(
        parseInt(fid),
        parseInt(x),
        parseInt(y),
        seedType
      );
      break;
    case "harvest":
      result = await harvest(parseInt(fid), parseInt(x), parseInt(y));
      break;
    case "fertilize":
      await fertilize(parseInt(fid), parseInt(x), parseInt(y));
      break;
  }
  return NextResponse.json(result);
}
