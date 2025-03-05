import { Metadata } from "next";
import App from "@/app/app";

const appUrl = process.env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fid: string }>;
}): Promise<Metadata> {
  const fid = (await params).fid;
  // const streak = await getStreakByFid(Number(fid));
  // if (!streak) {
  //   return {
  //     title: "FarVille",
  //   };
  // }
  // const user = await getUser(Number(fid));

  // Construct the dynamic image URL
  const imageUrl = new URL(`${appUrl}/api/og/flex-card/streak/${fid}`);

  // if (!user) {
  //   return {
  //     title: "FarVille",
  //     openGraph: {
  //       title: "FarVille",
  //       description: "Plant, grow, and harvest crops with your friends.",
  //     },
  //   };
  // }

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

export default async function StreakFlex() {
  return <App />;
}
