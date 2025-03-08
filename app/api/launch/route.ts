import { sendFrameNotification } from "@/lib/notifs";
import { getUsers } from "@/supabase/queries";
import { NextResponse } from "next/server";

export async function POST() {
  const sendingResults = [];
  try {
    const users = await getUsers({}, [13000, 13999]);

    console.log(`Sending notifications to ${users.length} users`);

    for (const user of users) {
      console.log(`Sending notification to ${user.fid}`);
      const result = await sendFrameNotification({
        fid: user.fid,
        title: "Brum Brum: new sharing features 🚜💨",
        body: "You can now flex your active streak or leaderboard position on the timeline!",
      });

      sendingResults.push({
        fid: user.fid,
        notificationsResult: result,
      });
      console.log(`Notification sent to ${user.fid}`);
    }

    console.log("Notifications sent");
  } catch (error) {
    console.error("Error sending notifications", error);

    return NextResponse.json({
      status: "error",
      message: "Error sending notifications",
      notificationRecap: {
        total: sendingResults.length,
        results: sendingResults,
      },
    });
  }

  return NextResponse.json({
    status: "ok",
    data: {
      total: sendingResults.length,
      results: sendingResults,
    },
  });
}
