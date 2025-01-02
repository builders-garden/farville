"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { GameProvider } from "./../context/GameContext";
import { useFrameContext } from "./../context/FrameContext";
import { useEffect, useState } from "react";
import { useSignIn } from "@/hooks/use-sign-in";
import Image from "next/image";

const GameWrapper = dynamic(() => import("./../components/GameWrapper"), {
  ssr: false,
});

const WelcomeOverlay = dynamic(() => import("./../components/WelcomeOverlay"), {
  ssr: false,
});

//  const TutorialOverlay = dynamic(() => import("./components/TutorialOverlay"), {
//    ssr: false,
//  });

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  // const [showTutorial, setShowTutorial] = useState(false);
  const { isSDKLoaded } = useFrameContext();
  const { signIn, isSignedIn, isLoading, error } = useSignIn();

  useEffect(() => {
    console.log("isSDKLoaded", isSDKLoaded);
    if (isSDKLoaded) {
      signIn();
    }
  }, [isSDKLoaded]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    //   // setShowTutorial(true);
  };

  return (
    <GameProvider>
      <main>
        <div className="fixed inset-0">
          <Image
            src="/images/welcome.png"
            alt="Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={100}
          />
        </div>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-xl font-medium">Loading...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative z-10 p-6 bg-red-500/20 backdrop-blur-sm rounded-lg border-2 border-red-500 shadow-lg">
              <p className="text-red-100 text-lg font-medium">{error}</p>
            </div>
          </div>
        )}
        {isSignedIn && (
          <div className="relative z-10">
            <AnimatePresence>
              {showWelcome && (
                <WelcomeOverlay onComplete={handleWelcomeComplete} />
              )}
              {/* {showTutorial && (
                <TutorialOverlay onComplete={() => setShowTutorial(false)} />
              )} */}
            </AnimatePresence>
            <GameWrapper />
          </div>
        )}
      </main>
    </GameProvider>
  );
}
