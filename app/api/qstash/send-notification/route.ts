import { env } from "@/lib/env";
import {
  createUserNotification,
  getUserNotificationDetails,
  getUserNotificationsByCategory,
  getHarvestableCellsCount,
  getExpiredBoostCellsCount,
} from "@/supabase/queries";
import {
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/frame-sdk";
import { NextRequest } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  fid: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  category: z.string().min(1),
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

  const { fid, title, text, category } = requestBody.data;
  const parsedFid = parseInt(fid);
  const timestamp = new Date();
  const minutes = 30;
  const xMinutesAgo = new Date(timestamp.getTime() - minutes * 60 * 1000);

  // Run initial checks in parallel
  const [notificationDetails, lastNotification] = await Promise.all([
    getUserNotificationDetails(parsedFid),
    getUserNotificationsByCategory(parsedFid, category, 1, {
      createdAfter: xMinutesAgo,
    }),
  ]);

  if (!notificationDetails) {
    return Response.json(
      { success: false, error: "User notifications not enabled" },
      { status: 404 }
    );
  }

  if (lastNotification?.length) {
    console.warn(
      `[send-notification-${timestamp.toISOString()}] user ${fid} has already received a notification of type "${category}" in the last ${minutes} minutes. Skipping...`
    );
    return Response.json({
      success: true,
      message: `Notification skipped - already sent a notification of type "${category}" in the last ${minutes} minutes`,
    });
  }

  // Check category-specific conditions
  if (category === "harvest" || category === "boost-expired") {
    const count = await (category === "harvest"
      ? getHarvestableCellsCount(parsedFid)
      : getExpiredBoostCellsCount(parsedFid));

    if (count === 0) {
      console.warn(
        `[send-notification-${timestamp.toISOString()}] user ${fid} has no ${
          category === "harvest" ? "harvestable" : "expired boost"
        } cells. Skipping notification...`
      );
      return Response.json({
        success: true,
        message: `Notification skipped - no ${
          category === "harvest" ? "harvestable" : "expired boost"
        } cells`,
      });
    }
  }

  // Prepare notification request
  const notificationRequest: SendNotificationRequest = {
    notificationId: crypto.randomUUID(),
    title,
    body: text,
    targetUrl: env.NEXT_PUBLIC_URL,
    tokens: [notificationDetails.token],
  };

  console.log(
    `[send-notification-${timestamp.toISOString()}]`,
    `sending "${category}" notification to ${fid}`
  );
  const response = await fetch(notificationDetails.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notificationRequest),
  });

  const responseJson = await response.json();

  if (response.status === 200) {
    // Ensure correct response
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
    if (responseBody.success === false) {
      return Response.json(
        { success: false, errors: responseBody.error.errors },
        { status: 500 }
      );
    }

    // Fail when rate limited
    if (responseBody.data.result.rateLimitedTokens.length) {
      return Response.json(
        { success: false, error: "Rate limited" },
        { status: 429 }
      );
    }

    // save the notification to the database
    const newUserNotification = await createUserNotification({
      fid: parsedFid,
      category,
    });

    console.log(
      `[send-notification-${timestamp.toISOString()}]`,
      `saved notification with id ${newUserNotification.id} for fid ${fid}`
    );

    return Response.json({
      success: true,
      notification: newUserNotification.id,
    });
  } else {
    return Response.json(
      { success: false, error: responseJson },
      { status: 500 }
    );
  }
}
