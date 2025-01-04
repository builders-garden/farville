"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { GameProvider } from "./../context/GameContext";
import { useSignIn } from "@/hooks/use-sign-in";
import Image from "next/image";
import { useFrameContext } from "@/context/FrameContext";

const GameWrapper = dynamic(() => import("./../components/GameWrapper"), {
  ssr: false,
});

const WelcomeOverlay = dynamic(() => import("./../components/WelcomeOverlay"), {
  ssr: false,
});

export default function Game() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { isSDKLoaded, context } = useFrameContext();
  const { isSignedIn, isLoading, error } = useSignIn();

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  if (!context && isSDKLoaded && !isLoading) {
    return (
      <main className="h-screen w-screen overflow-hidden">
        <div className="fixed inset-0">
          <Image
            src="/images/welcome.png"
            alt="Background"
            fill
            className="object-contain"
            priority
            sizes="100vw"
            quality={100}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4 [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            FarVille
          </h1>
          <p className="text-lg text-white mb-6 px-4 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]">
            Plant, grow, and harvest crops on Farcaster.
          </p>
          <div className="flex gap-4 mb-8">
            <a
              href="https://warpcast.com/~/channel/farville"
              className="px-8 py-3 bg-[#794BC4] hover:bg-[#6a42ab] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span>Play on Warpcast</span>
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
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
      {isLoading && context && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-xl font-medium">Loading...</p>
          </div>
        </div>
      )}
      {error && context && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-10 p-6 bg-red-500/20 backdrop-blur-sm rounded-lg border-2 border-red-500 shadow-lg">
            <p className="text-red-100 text-lg font-medium">{error}</p>
          </div>
        </div>
      )}
      {isSignedIn && (
        <GameProvider>
          <div className="relative z-10">
            <AnimatePresence>
              {showWelcome && (
                <WelcomeOverlay onComplete={handleWelcomeComplete} />
              )}
            </AnimatePresence>
            <GameWrapper />
          </div>
        </GameProvider>
      )}
    </main>
  );
}
