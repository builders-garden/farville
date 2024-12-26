"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useState } from "react";
const GameWrapper = dynamic(() => import("./components/GameWrapper"), {
  ssr: false,
});

const WelcomeOverlay = dynamic(() => import("./components/WelcomeOverlay"), {
  ssr: false,
});

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

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
