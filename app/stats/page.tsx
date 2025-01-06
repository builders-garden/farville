import { AnimatePresence } from "framer-motion";
import { Metadata } from "next";
import { getReferralLeaderboard, getStats } from "../../supabase/queries";
import StatsPage from "../../components/StatsPage";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "FarVille - Stats",
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
    title: "FarVille - Stats",
    openGraph: {
      title: "FarVille - Stats",
      description: "Plant, grow, and harvest crops with your friends.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export const revalidate = 60; // revalidate every 60 seconds
export const dynamic = "force-dynamic";

export default async function Stats() {
  const referralLeaderboard = await getReferralLeaderboard(5);
  const gameStats = await getStats();

  return (
    <main className="bg-green-800">
      <AnimatePresence>
        <StatsPage
          referralLeaderboard={referralLeaderboard}
          gameStats={gameStats}
        />
      </AnimatePresence>
    </main>
  );
}
