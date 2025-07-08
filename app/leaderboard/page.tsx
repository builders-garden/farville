import { AnimatePresence } from "motion/react";
import { Metadata } from "next";
import LeaderboardPage from "../../components/LeaderboardPage";
import { env } from "@/lib/env";
import { getReferralLeaderboard } from "@/lib/prisma/queries";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Farville - Leaderboard 🏆",
    action: {
      type: "launch_frame",
      name: "Farville",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farville - Leaderboard",
    openGraph: {
      title: "Farville - Leaderboard",
      description: "Plant, grow, and harvest crops with your friends.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function Leaderboard() {
  const leaderboard = await getReferralLeaderboard();

  return (
    <main className="bg-green-800">
      <AnimatePresence>
        <LeaderboardPage leaderboard={leaderboard} />
      </AnimatePresence>
    </main>
  );
}
