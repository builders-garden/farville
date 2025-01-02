"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { GameProvider } from "../context/GameContext";
import { useFrameContext } from "../context/FrameContext";
import { useEffect, useState } from "react";

const GameWrapper = dynamic(() => import("../components/GameWrapper"), {
  ssr: false,
});

const WelcomeOverlay = dynamic(() => import("../components/WelcomeOverlay"), {
  ssr: false,
});

//  const TutorialOverlay = dynamic(() => import("./components/TutorialOverlay"), {
//    ssr: false,
//  });

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  // const [showTutorial, setShowTutorial] = useState(false);
  const { isSDKLoaded } = useFrameContext();

  useEffect(() => {
    console.log("isSDKLoaded", isSDKLoaded);
  }, [isSDKLoaded]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    //   // setShowTutorial(true);
  };

  return (
    <GameProvider>
      <main className="bg-green-800">
        <AnimatePresence>
          {showWelcome && <WelcomeOverlay onComplete={handleWelcomeComplete} />}
          {/* {showTutorial && (
            <TutorialOverlay onComplete={() => setShowTutorial(false)} />
          )} */}
        </AnimatePresence>
        <GameWrapper />
      </main>
    </GameProvider>
  );
}
