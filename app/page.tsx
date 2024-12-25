"use client";

import { useState } from "react";
import { AudioProvider } from "./context/AudioContext";
import { GameProvider } from "./context/GameContext";
import GameWrapper from "./components/GameWrapper";
import WelcomeOverlay from "./components/WelcomeOverlay";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <main className="min-h-screen bg-green-800">
      <AudioProvider>
        <GameProvider>
          <AnimatePresence>
            {showWelcome && (
              <WelcomeOverlay onStart={() => setShowWelcome(false)} />
            )}
          </AnimatePresence>
          <GameWrapper />
        </GameProvider>
      </AudioProvider>
    </main>
  );
}
