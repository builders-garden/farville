import { CROP_DATA } from "@/lib/game-constants";
import { getGridCell, killGridCell } from "@/supabase/queries";
import { NextRequest } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  fid: z.number().min(1),
  x: z.number().min(1),
  y: z.number().min(1),
  plantedAt: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { fid, x, y, plantedAt } = requestBody.data;

  try {
    const cell = await getGridCell(fid, x, y, plantedAt);

    if (!cell) {
      return Response.json(
        { success: false, error: "Grid cell not found" },
        { status: 404 }
      );
    }

    const growthTime = CROP_DATA[cell.cropType!].growthTime;
    const deathTime = CROP_DATA[cell.cropType!].deathTime;

    const plantedAtDate = new Date(plantedAt);
    const deathTimeDate = new Date(plantedAtDate.getTime() + growthTime + deathTime);

    if (new Date() < deathTimeDate) {
      return Response.json(
        {
          success: false,
          error: "Crop is not ready to be killed yet",
        }
      )
    } else {
      await killGridCell(fid,x,y) // this resets the cell
    }

    console.log(
      `[${new Date().toISOString()}] killed crop at cell ${x}/${y} for user ${fid}`
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] error killing crop for user ${fid}`,
      error
    );

    return Response.json(
      { success: false, error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
