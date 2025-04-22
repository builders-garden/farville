import { Metadata } from "next";
import { getRequestById } from "@/supabase/queries";
import App from "@/app/app";
import { env } from "@/lib/env";
import { getUserByMode } from "@/lib/prisma/queries";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const requestId = (await params).id;
  const request = await getRequestById(Number(requestId));
  if (!request) {
    const frame = {
      version: "next",
      imageUrl: `${appUrl}/images/feed.png`,
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
      title: "Farville",
      openGraph: {
        title: "Farville",
        description: "Plant, grow, and harvest crops with your friends.",
      },
      other: {
        "fc:frame": JSON.stringify(frame),
      },
    };
  }
  const fid = request.fid;
  const user = await getUserByMode(Number(fid));

  // Construct the dynamic image URL
  const imageUrl = new URL(`${appUrl}/api/og/requests/${requestId}`);

  if (!user) {
    return {
      title: "Farville",
      openGraph: {
        title: "Farville",
        description: "Plant, grow, and harvest crops with your friends.",
      },
    };
  }
  const buttonTitle =
    `Donate to ${user.username} 🧑‍🌾`.length > 32
      ? "Donate 🧑‍🌾"
      : `Donate to ${user.username} 🧑‍🌾`;

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: buttonTitle,
      action: {
        type: "launch_frame",
        name: "Farville",
        url: `${appUrl}/requests/${requestId}`,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: `Farville - Donate to ${user.username} 🧑‍🌾`,
    openGraph: {
      title: `Farville - Donate to ${user.username} 🧑‍🌾`,
      description: "Plant, grow, and harvest crops with your friends.",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function RequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const requestId = (await params).id;

  return <App initialOverlay={{ type: "requests", id: Number(requestId) }} />;
}
