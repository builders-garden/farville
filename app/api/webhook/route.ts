import { fetchUser } from "@/app/lib/neynar";
import { sendFrameNotification } from "@/app/lib/notifs";
import {
  setUserNotificationDetails,
  deleteUserNotificationDetails,
  getUser,
  createUser,
} from "@/app/supabase/queries";
import {
  ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/frame-node";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const requestJson = await request.json();

  let data;
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType;

    switch (error.name) {
      case "VerifyJsonFarcasterSignature.InvalidDataError":
      case "VerifyJsonFarcasterSignature.InvalidEventDataError":
        // The request data is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
        // The app key is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 401 }
        );
      case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
        // Internal error verifying the app key (caller may want to try again)
        return Response.json(
          { success: false, error: error.message },
          { status: 500 }
        );
    }
  }

  const fid = data.fid;
  const event = data.event;

  switch (event.event) {
    case "frame_added":
      if (event.notificationDetails) {
        const user = await getUser(fid);
        if (!user) {
          const neynarUser = await fetchUser(fid.toString());
          await createUser({
            fid,
            username: neynarUser.username,
            displayName: neynarUser.display_name,
            avatarUrl: neynarUser.pfp_url,
            walletAddress: neynarUser.custody_address,
            xp: 0,
            coins: 0,
            expansions: 1,
            notificationDetails: JSON.stringify(event.notificationDetails),
          });
        } else {
          await setUserNotificationDetails(fid, event.notificationDetails);
        }
        await sendFrameNotification({
          fid,
          title: "FarVille",
          body: "FarVille is now added to Warpcast",
        });
      } else {
        await deleteUserNotificationDetails(fid);
      }

      break;
    case "frame_removed":
      await deleteUserNotificationDetails(fid);

      break;
    case "notifications_enabled":
      await setUserNotificationDetails(fid, event.notificationDetails);
      await sendFrameNotification({
        fid,
        title: "Ding ding ding",
        body: "Notifications for FarVille are now enabled",
      });

      break;
    case "notifications_disabled":
      await deleteUserNotificationDetails(fid);

      break;
  }

  return Response.json({ success: true });
}
