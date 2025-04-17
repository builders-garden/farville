import { Metadata } from "next";
import App from "@/app/app";
import { getUser } from "@/supabase/queries";
import { env } from "@/lib/env";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fid: string; timestamp: string }>;
}): Promise<Metadata> {
  const { fid, timestamp } = await params;

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
    `${appUrl}/api/og/flex-card/welcome-leagues/${fid}/${timestamp}`
  );

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "Join me on Farville 🧑‍🌾",
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

export default async function WelcomeLeaguesFlex() {
  return <App />;
}
