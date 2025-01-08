import {
  createUserNotification,
  getUserNotificationDetails,
  getUserNotificationsByCategory,
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

  const notificationDetails = await getUserNotificationDetails(parseInt(fid));

  // before sending the notification, check if the user has already received a notification of this type
  const lastUserNotifications = await getUserNotificationsByCategory(
    parseInt(fid),
    category,
    3
  );

  // check if the last 3 notifications were sent less than 3 minutes ago
  if (
    lastUserNotifications.length === 0 ||
    lastUserNotifications.every(
      (notification) =>
        new Date(notification.createdAt).getTime() + 3 * 60 * 1000 >
        new Date().getTime()
    )
  ) {
    console.log(
      `[send-notification-${new Date().toISOString()}]`,
      `sending "${category}" notification to ${fid}`
    );
    const response = await fetch(notificationDetails.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title: title,
        body: text,
        targetUrl: process.env.NEXT_PUBLIC_URL!,
        tokens: [notificationDetails.token],
      } satisfies SendNotificationRequest),
    });

    const responseJson = await response.json();

    if (response.status === 200) {
      // Ensure correct response
      const responseBody =
        sendNotificationResponseSchema.safeParse(responseJson);
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
        fid: parseInt(fid),
        category,
      });

      console.log(
        `[send-notification-${new Date().toISOString()}]`,
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
  } else {
    console.warn(
      `[send-notification-${new Date().toISOString()}] user ${fid} has already received a notification of type "${category}" in the last 3 minutes. Skipping...`
    );

    return Response.json({
      success: true,
      message: "Notification already sent",
    });
  }
}
