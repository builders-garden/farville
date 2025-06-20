import { sendDelayedNotificationToService } from "@/lib/game-notifications";
import {
  createClanRequest,
  getClanByFid,
  getItemById,
  getRequestById,
  getUser,
} from "@/lib/prisma/queries";
import { UserClan } from "@/lib/prisma/types";
import { Mode } from "@/lib/types/game";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { env } from "@/lib/env";
import axios from "axios";

const createClanRequestSchema = z.object({
  requestId: z.string().min(1, "Request ID is required").optional(),
  clanId: z.string().min(1, "Clan ID is required"),
  itemId: z.number().min(1).optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const fid = req.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(Number(fid))) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const body = await req.json();
    const parsedData = createClanRequestSchema.parse(body);

    const { requestId, clanId, itemId, quantity } = parsedData;

    // if requestId is not provided, itemId and quantity must be provided
    if (!requestId && (!itemId || !quantity)) {
      return NextResponse.json(
        {
          error:
            "If requestId is not provided, itemId and quantity are required",
        },
        { status: 400 }
      );
    }

    const user = await getUser(Number(fid));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const item = itemId ? await getItemById(itemId) : null;
    const userRequest = requestId ? await getRequestById(requestId) : null;

    const clanData = (await getClanByFid(Number(fid), {
      includeClan: true,
      includeMembers: true,
    })) as UserClan | null;

    if (!clanData) {
      return NextResponse.json(
        { error: "You are not a member of any clan" },
        { status: 404 }
      );
    }

    const notificationTitle = requestId
      ? "A new clan request was shared"
      : "Someone needs your help!";

    const notificationText = requestId
      ? `${user.username} share a new request. Donate ${userRequest?.item?.name} x${userRequest?.quantity}`
      : `${user.username} needs to donate ${item?.name} x${quantity}. Create a request to help them!`;

    await Promise.all([
      createClanRequest({
        requestId,
        clanId,
        itemId,
        quantity,
        fid: Number(fid),
      }),
      // Emit socket event for real-time updates
      (async () => {
        try {
          await axios.post(
            `${env.FARVILLE_SERVICE_URL}/api/clan/${clanId}/request`,
            {
              requestId,
              itemId,
              quantity,
              userData: {
                fid: user.fid,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                selectedAvatarUrl: user.selectedAvatarUrl,
                mintedOG: user.mintedOG,
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-fid": fid,
                "x-api-secret": env.FARVILLE_SERVICE_API_KEY,
              },
            }
          );
        } catch (socketError) {
          console.warn(
            "Failed to emit socket event for clan request:",
            socketError
          );
        }
      })(),
      clanData.clan.members.map((member) => {
        if (member.fid === Number(fid)) return; // Skip notifying self
        return sendDelayedNotificationToService(
          member.fid,
          notificationTitle,
          notificationText,
          "clan-request",
          Mode.Classic,
          0
        );
      }),
    ]);

    return NextResponse.json(
      {
        status: "success",
        message: `Request ${requestId} shared to clan ${clanId} successfully.`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
