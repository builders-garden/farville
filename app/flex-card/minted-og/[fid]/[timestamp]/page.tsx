import { Metadata } from "next";
import App from "@/app/app";
import { env } from "@/lib/env";
import { getUserByMode } from "@/lib/prisma/queries";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fid: string; timestamp: string }>;
}): Promise<Metadata> {
  const { fid, timestamp } = await params;

  const user = await getUserByMode(Number(fid));

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
    `${appUrl}/api/og/flex-card/minted-og/${fid}/${timestamp}`
  );

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: `Play Farville 🧑‍🌾`,
      action: {
        type: "launch_frame",
        name: "Farville",
        url: `${appUrl}`,
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

export default async function MintedOgFlex() {
  return <App />;
}
