import { NextRequest, NextResponse, userAgent } from "next/server";
import { SeedType, PerkType, ActionType, Mode } from "@/lib/types/game";
import { fertilizeBulk, harvestBulk, perkBulk, plantBulk } from "./utils";
import { getUserByMode } from "@/lib/prisma/queries";
import Logger from "@/lib/logger";
import { z } from "zod";
import { UserAgent } from "@/lib/types/user-agent";
import { getNextServerIp } from "@/lib/track";
// import { Geo } from "@/lib/types/geolocation";

export interface GridBulkRequest {
  action: ActionType;
  itemSlug?: SeedType | PerkType;
  cells: {
    x: number;
    y: number;
  }[];
  mode: Mode;
}

const requestSchema = z.object({
  action: z.nativeEnum(ActionType),
  itemSlug: z
    .union([z.nativeEnum(SeedType), z.nativeEnum(PerkType)])
    .optional(),
  cells: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
    })
  ),
  mode: z.nativeEnum(Mode),
});

export const POST = async (req: NextRequest) => {
  let ip: string | undefined = undefined;
  // let geolocationDetails: Geo | null = null;
  let userAgentDetails: UserAgent | null = null;
  try {
    userAgentDetails = userAgent(req); // TODO: use this outside of vercel https://github.com/mfts/papermark/blob/main/lib/utils/user-agent.ts
    ip = await getNextServerIp(req);
    // if (ip) geolocationDetails = await getGeolocation(ip);
  } catch (error) {
    console.error("Error getting geolocation:", error);
  }
  const fid = req.headers.get("x-user-fid");
  console.log(
    "/api/grid-bulk",
    "fid",
    fid,
    "ip",
    ip,
    "userAgent",
    JSON.stringify(userAgentDetails)
    // "geolocation",JSON.stringify(geolocationDetails)
  );

  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  Logger.logTest(`/api/grid-bulk user ${fid} started at ${new Date()}`);

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { action, itemSlug, cells, mode } = requestBody.data;
  Logger.logTest(
    `/api/grid-bulk user ${fid} body parsed, action ${action} item ${itemSlug} date ${new Date()}`
  );

  const user = await getUserByMode(Number(fid), mode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  Logger.logTest(
    `/api/grid-bulk user ${fid} action ${action} user found ${
      user.username
    } date ${new Date()}`
  );

  try {
    switch (action) {
      case ActionType.Plant:
        if (!itemSlug) {
          return NextResponse.json(
            { error: "Item slug is required" },
            { status: 400 }
          );
        }
        if (!Object.values(SeedType).includes(itemSlug as SeedType)) {
          return NextResponse.json(
            { error: "Invalid item slug" },
            { status: 400 }
          );
        }
        Logger.logTest(
          `/api/grid-bulk user ${fid} action ${action} planting started ${itemSlug} date ${new Date()}`
        );
        const plantResult = await plantBulk(
          Number(fid),
          cells,
          itemSlug as SeedType,
          mode
        );
        Logger.logTest(
          `/api/grid-bulk user ${fid} action ${action} planting finished ${
            plantResult.type
          } date ${new Date()}`
        );
        return NextResponse.json({
          success: true,
          data: plantResult,
        });
      case ActionType.Harvest:
        Logger.logTest(
          `/api/grid-bulk user ${fid} action ${action} harvesting started date ${new Date()}`
        );
        const harvestResult = await harvestBulk(Number(fid), cells, mode);
        Logger.logTest(
          `/api/grid-bulk user ${fid} action ${action} harvesting finished ${
            harvestResult.cells.ok.length
          } ${harvestResult.cells.nok.length} date ${new Date()}`
        );
        return NextResponse.json({
          success: true,
          data: harvestResult,
        });
      case ActionType.ApplyPerk:
        if (!itemSlug) {
          return NextResponse.json(
            { error: "Item slug is required" },
            { status: 400 }
          );
        }
        if (!Object.values(PerkType).includes(itemSlug as PerkType)) {
          return NextResponse.json(
            { error: "Invalid item slug" },
            { status: 400 }
          );
        }
        Logger.logTest(
          `/api/grid-bulk user ${fid} action ${action} applying perk started ${itemSlug} date ${new Date()}`
        );
        const perkResult = await perkBulk(
          Number(fid),
          cells,
          itemSlug as PerkType,
          mode
        );
        Logger.logTest(
          `/api/grid-bulk user ${fid} action ${action} applying perk finished ${
            perkResult.type
          } date ${new Date()}`
        );
        return NextResponse.json({
          success: true,
          data: perkResult,
        });
      case ActionType.Fertilize:
        Logger.logTest(
          `/api/grid-bulk user ${fid} action ${action} fertilizing started date ${new Date()}`
        );
        const fertilizeResult = await fertilizeBulk(Number(fid), cells, mode);
        Logger.logTest(
          `/api/grid-bulk user ${fid} action ${action} fertilizing finished ${
            fertilizeResult.type
          } date ${new Date()}`
        );
        return NextResponse.json({
          success: true,
          data: fertilizeResult,
        });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error({ action, cells, error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
