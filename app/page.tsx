import { env } from "@/lib/env";
import { Metadata } from "next";
import App from "./app";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Play FarVille 🧑‍🌾",
    action: {
      type: "launch_frame",
      name: "FarVille",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FarVille",
    openGraph: {
      title: "FarVille",
      description: "Plant, grow, and harvest crops with your friends.",
      images: [
        {
          url: `${appUrl}/images/og-preview.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
