"use client";

import sdk from "@farcaster/frame-sdk";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const GameWrapper = dynamic(() => import("./components/GameWrapper"), {
  ssr: false,
});

const WelcomeOverlay = dynamic(() => import("./components/WelcomeOverlay"), {
  ssr: false,
});

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <main className="min-h-screen bg-green-800">
      <AnimatePresence>
        {showWelcome && (
          <WelcomeOverlay onStart={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>
      <GameWrapper />
    </main>
  );
}
