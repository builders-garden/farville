import { sendFrameNotification } from "@/lib/notifs";
import { getUsers } from "@/supabase/queries";
import { NextResponse } from "next/server";

export async function POST() {
  const users = await getUsers({}, [2500, 2999]);
  // const users2 = await getUsers({}, [1000, 1999]);
  // const users3 = await getUsers({}, [2000, 2999]);

  console.log(`Sending notifications to ${users.length} users`);

  const notificationsResult = [];
  for (const user of users) {
    console.log(`Sending notification to ${user.fid}`);
    const result = await sendFrameNotification({
      fid: user.fid,
      title: "FarVille alpha is here!",
      body: "Start farming today and compete in the global leaderboard!",
    });

    notificationsResult.push({
      fid: user.fid,
      notificationsResult: result,
    });
    console.log(`Notification sent to ${user.fid}`);
  }

  console.log("Notifications sent");

  return NextResponse.json({
    status: "ok",
    data: {
      total: users.length,
      users,
      notificationsResult,
    },
  });
}
