import { env } from "@/lib/env";
import { Metadata } from "next";
import App from "./app";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = (_searchParams: {
  [key: string]: string | string[] | undefined;
}) => {
  const searchParamsString = Object.entries(_searchParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return {
    version: "next",
    imageUrl: `${appUrl}/images/feed.png`,
    button: {
      title: "Play Farville 🧑‍🌾",
      action: {
        type: "launch_frame",
        name: "Farville",
        url: searchParamsString ? `${appUrl}/?${searchParamsString}` : appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const _searchParams = await searchParams;
  return {
    title: "Farville",
    openGraph: {
      title: "Farville",
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
      "fc:frame": JSON.stringify(frame(_searchParams)),
    },
  };
}

export default function Home() {
  return <App />;
}
