import { Metadata } from "next";
import App from "@/app/app";
import { getUser } from "@/supabase/queries";
import { env } from "@/lib/env";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ fid: string; timestamp: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { fid, timestamp } = await params;
  const searchParamsObj = await searchParams;
  const friends = searchParamsObj.friends === "true";
  const quests = searchParamsObj.quests === "true";

  const user = await getUser(Number(fid));

  if (!user || !timestamp) {
    return {
      title: "Farville",
      openGraph: {
        title: "Farville",
        description: "Plant, grow, and harvest crops with your friends.",
      },
    };
  }

  const imageUrl = new URL(
    `${appUrl}/api/og/flex-card/leaderboard/${fid}/${timestamp}/short?friends=${friends}&quests=${quests}`
  );

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "Play Farville 🧑‍🌾",
      action: {
        type: "launch_frame",
        name: "Farville",
        url: appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: "Play Farville 🧑‍🌾",
    openGraph: {
      title: "Play Farville 🧑‍🌾",
      description: "Plant, grow, and harvest crops with your friends.",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function StreakFlex() {
  return <App />;
}
