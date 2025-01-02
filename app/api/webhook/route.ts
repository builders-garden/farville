import { fetchUser } from "@/lib/neynar";
import { sendFrameNotification } from "@/lib/notifs";
import { trackEvent } from "@/lib/posthog/server";
import {
  setUserNotificationDetails,
  deleteUserNotificationDetails,
  getUser,
  createUser,
} from "@/supabase/queries";
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
    console.log("parsing webhook event");
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
    console.log("parsed webhook event");
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
        console.log("user", user);
        if (!user) {
          console.log("creating user");
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
          console.log("created user");
          trackEvent(fid, "signup", {
            fid,
            location: "frame_added",
          });
        } else {
          console.log("setting notification details");
          await setUserNotificationDetails(fid, event.notificationDetails);
        }
        console.log("sending frame notification");
        await sendFrameNotification({
          fid,
          title: "Welcome to FarVille 🧑‍🌾",
          body: "The 1st farming season will begin in January 2025!",
        });
      } else {
        console.log("deleting notification details");
        await deleteUserNotificationDetails(fid);
      }
      const capturedEvent = trackEvent(fid, "frame_added", {
        fid,
      });
      console.log("tracked event", capturedEvent);
      break;
    case "frame_removed":
      await deleteUserNotificationDetails(fid);
      trackEvent(fid, "frame_removed", {
        fid,
      });
      break;
    case "notifications_enabled":
      await setUserNotificationDetails(fid, event.notificationDetails);
      await sendFrameNotification({
        fid,
        title: "Ding ding ding",
        body: "Notifications for FarVille are now enabled",
      });
      trackEvent(fid, "notifications_enabled", {
        fid,
      });
      break;
    case "notifications_disabled":
      await deleteUserNotificationDetails(fid);
      trackEvent(fid, "notifications_disabled", {
        fid,
      });
      break;
  }

  return Response.json({ success: true });
}
