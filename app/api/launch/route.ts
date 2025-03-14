import { sendFrameNotification } from "@/lib/notifs";
import { getUsersByFids } from "@/supabase/queries";
import { NextResponse } from "next/server";
import { OG_FIDS_LIST } from "./constants";

export async function POST() {
  const sendingResults = [];
  try {
    // const users = await getUsers({}, [13000, 13999]);
    // OG_FIDS_LIST is too big so we need to split it in chunks
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < OG_FIDS_LIST.length; i += chunkSize) {
      chunks.push(OG_FIDS_LIST.slice(i, i + chunkSize));
    }

    console.log({
      totalChunks: chunks.length,
      totalUsers: OG_FIDS_LIST.length,
      chunksSizes: chunks.map((chunk) => chunk.length),
    });

    for (const chunk of chunks) {
      const users = await getUsersByFids(chunk);

      console.log(`Sending notifications to ${users.length} users`);

      for (const user of users) {
        console.log(`Sending notification to ${user.fid}`);
        const result = await sendFrameNotification({
          fid: user.fid,
          title: "You are a Farville OG 🎉",
          body: "Claim your NFT on Farville, now!",
        });

        sendingResults.push({
          fid: user.fid,
          notificationsResult: result,
        });
        console.log(`Notification sent to ${user.fid}`);
      }
    }

    console.log("Notifications sent");
  } catch (error) {
    console.error("Error sending notifications", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Error sending notifications",
        notificationRecap: {
          total: sendingResults.length,
          results: sendingResults,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "ok",
    data: {
      total: sendingResults.length,
      results: sendingResults,
    },
  });
}
