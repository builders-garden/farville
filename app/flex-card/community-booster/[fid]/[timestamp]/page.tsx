import { Metadata } from "next";
import App from "@/app/app";
import { env } from "@/lib/env";
import { getUserByMode } from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";

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
  const mode = searchParamsObj.mode;
  const donationId = searchParamsObj.id;

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
    `${appUrl}/api/og/flex-card/community-booster/${fid}/${timestamp}?mode=${mode}&id=${donationId}`
  );

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: `Contribute Farmer Points! 🌱`,
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
    title: `Contribute Farmer Points! 🌱`,
    openGraph: {
      title: `Contribute Farmer Points! 🌱`,
      description: "Plant, grow, and harvest crops with your friends.",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function CommunityBoosterFlex() {
  return <App />;
}
