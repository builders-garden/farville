import { Metadata } from "next";
import App from "@/app/app";
import { env } from "@/lib/env";
import { getUserByMode } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fid: string; clanId: string; timestamp: string }>;
}): Promise<Metadata> {
  const { fid, clanId, timestamp } = await params;

  const user = await getUserByMode(Number(fid), Mode.Classic);

  if (!user) {
    return {
      title: "Farville",
      openGraph: {
        title: "Farville",
        description: "Plant, grow, and harvest crops with your friends.",
      },
    };
  }

  const imageUrl = new URL(
    `${appUrl}/api/og/flex-card/clan/${fid}/${clanId}/${timestamp}`
  );

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: `Join my Feud 🧑‍🌾`,
      action: {
        type: "launch_frame",
        name: "Farville",
        url: `${appUrl}/flex-card/clan/${fid}/${clanId}/${timestamp}`,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: `Play Farville 🧑‍🌾`,
    openGraph: {
      title: `Play Farville 🧑‍🌾`,
      description: "Plant, grow, and harvest crops with your friends.",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function ClanPage({
  params,
}: {
  params: Promise<{ clanId: string }>;
}) {
  const clanId = (await params).clanId;

  return <App initialOverlay={{ type: "clan", clanId }} />;
}
