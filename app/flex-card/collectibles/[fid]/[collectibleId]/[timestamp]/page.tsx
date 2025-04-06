import { Metadata } from "next";
import App from "@/app/app";
import { getUser } from "@/supabase/queries";
import { env } from "@/lib/env";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fid: string; collectibleId: string; timestamp: string }>;
}): Promise<Metadata> {
  const { fid, collectibleId, timestamp } = await params;

  const user = await getUser(Number(fid));

  if (!user) {
    return {
      title: "FarVille",
      openGraph: {
        title: "FarVille",
        description: "Plant, grow, and harvest crops with your friends.",
      },
    };
  }

  const imageUrl = new URL(
    `${appUrl}/api/og/flex-card/collectibles/${fid}/${collectibleId}/${timestamp}`
  );

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: `Play FarVille 🧑‍🌾`,
      action: {
        type: "launch_frame",
        name: "FarVille",
        url: `${appUrl}`,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: `Play FarVille 🧑‍🌾`,
    openGraph: {
      title: `Play FarVille 🧑‍🌾`,
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
