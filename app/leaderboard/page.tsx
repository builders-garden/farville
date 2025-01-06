import { AnimatePresence } from "framer-motion";
import { Metadata } from "next";
import LeaderboardPage from "../../components/LeaderboardPage";
import { getReferralLeaderboard } from "../../supabase/queries";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "FarVille - Leaderboard 🏆",
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
    title: "FarVille - Leaderboard",
    openGraph: {
      title: "FarVille - Leaderboard",
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
