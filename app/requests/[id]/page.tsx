import { Metadata } from "next";
import { getRequestById, getUser } from "@/supabase/queries";
import App from "@/app/app";
import { env } from "@/lib/env";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const requestId = (await params).id;
  const request = await getRequestById(Number(requestId));
  if (!request) {
    return {
      title: "FarVille",
    };
  }
  const fid = request.fid;
  const user = await getUser(Number(fid));

  // Construct the dynamic image URL
  const imageUrl = new URL(`${appUrl}/api/og/requests/${requestId}`);

  if (!user) {
    return {
      title: "FarVille",
      openGraph: {
        title: "FarVille",
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
        name: "FarVille",
        url: `${appUrl}/requests/${requestId}`,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: `FarVille - Donate to ${user.username} 🧑‍🌾`,
    openGraph: {
      title: `FarVille - Donate to ${user.username} 🧑‍🌾`,
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
