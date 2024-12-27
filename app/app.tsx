"use client";

import sdk from "@farcaster/frame-sdk";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { GameProvider } from "./context/GameContext";

const GameWrapper = dynamic(() => import("./components/GameWrapper"), {
  ssr: false,
});

const WelcomeOverlay = dynamic(() => import("./components/WelcomeOverlay"), {
  ssr: false,
});

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
      const context = await sdk.context;
      if (context && context.client.safeAreaInsets) {
        setSafeAreaInsets(context.client.safeAreaInsets);
      }
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <GameProvider>
      <main className="bg-green-800">
        <AnimatePresence>
          {showWelcome && (
            <WelcomeOverlay
              safeAreaInsets={safeAreaInsets}
              onStart={() => setShowWelcome(false)}
            />
          )}
        </AnimatePresence>
        <GameWrapper safeAreaInsets={safeAreaInsets} />
      </main>
    </GameProvider>
  );
}
