"use client";

import { useFrameContext } from "@/context/FrameContext";
import { OverlayConfig } from "@/context/GameContext";
import { useSignIn } from "@/hooks/use-sign-in";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import React, { useRef, useState } from "react";
import { GameProvider } from "./../context/GameContext";

export default function Game({
  children,
  initialOverlay,
}: {
  children?: React.ReactNode;
  initialOverlay?: OverlayConfig;
}) {
  const { isSDKLoaded, context } = useFrameContext();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isInMaintenance = false;

  const { isSignedIn, isLoading, error } = useSignIn(isInMaintenance);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!context && isSDKLoaded && !isLoading) {
    return (
      <main className="h-screen w-full flex flex-col sm:flex-row gap-4 sm:gap-24 items-center justify-start sm:justify-center bg-[#1E3320] bg-[conic-gradient(#265B3B_90deg,_#396549_90deg_180deg,_#265B3B_180deg_270deg,_#396549_270deg)] bg-[length:144px_144px] p-4 sm:p-0 overflow-hidden">
        <div className="h-full w-full overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-24 items-center justify-center min-h-full py-4 sm:py-12">
            {/* Phone Preview */}
            <div className="relative w-[200px] sm:w-[320px] h-[400px] sm:h-[640px] rounded-[32px] sm:rounded-[40px] bg-black border border-zinc-900 sm:border-2 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[16px] sm:h-[30px] bg-black rounded-b-[16px] sm:rounded-b-[20px] border-x border-b sm:border-x-2 sm:border-b-2 border-zinc-900" />
              <div className="absolute inset-2 sm:inset-3 rounded-[28px] sm:rounded-[32px] overflow-hidden bg-gray-800">
                <video
                  ref={videoRef}
                  src="https://i.imgur.com/eCBtpU9.mp4"
                  autoPlay
                  loop
                  muted={isMuted}
                  className="w-full h-full object-cover opacity-90"
                />
                <button
                  onClick={toggleMute}
                  className="absolute bottom-4 right-4 p-2 sm:p-4 bg-black/70 rounded-full hover:bg-black/95 transition-colors w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center"
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-4 sm:gap-12">
              <div className="flex flex-col gap-6">
                <div className="flex flex-row gap-6 items-center">
                  <Image
                    src="/images/splash.png"
                    alt="Farville Logo"
                    className="h-16 sm:h-20 w-16 sm:w-20 object-contain"
                    width={96}
                    height={96}
                  />
                  <div className="flex flex-col">
                    <h1 className=" text-lg sm:text-2xl font-bold text-white">
                      Farville
                    </h1>
                    <p className="text-white/70 text-xs sm:text-base">
                      Built by{" "}
                      <a
                        href="https://builders.garden"
                        target="_blank"
                        className="text-white/90 underline hover:text-white transition-colors"
                      >
                        Builders Garden
                      </a>{" "}
                      team
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-lg text-white/80">
                  Plant, grow, and harvest crops with friends.
                </p>
              </div>

              <div className="flex flex-row gap-0 sm:gap-4">
                <div className="flex flex-col gap-0 sm:gap-4">
                  <div className="hidden sm:block w-fit rounded-xl p-2 bg-white/10 backdrop-blur-sm border-2 border-white/20">
                    <QRCodeSVG
                      value="https://warpcast.com/~/frames/launch?domain=farville.farm"
                      className="w-fit rounded-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full sm:w-fit">
                  <a
                    href="https://warpcast.com/~/frames/launch?domain=farville.farm"
                    target="_blank"
                    className="w-full p-4 bg-[#8A63D2] text-white rounded-xl flex flex-row gap-4 items-center justify-start transition-transform hover:scale-105"
                  >
                    <Image
                      src="/images/fc-logo.png"
                      alt="Farcaster Logo"
                      width={32}
                      height={32}
                    />
                    <span className="text-xs sm:text-lg font-medium">
                      Play on Farcaster
                    </span>
                  </a>

                  <a
                    href="https://docs.farville.farm/gameplay"
                    target="_blank"
                    className="w-full p-4 border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white text-left rounded-xl flex flex-row gap-4 items-center justify-start transition-transform hover:scale-105"
                  >
                    <Image
                      src="/images/docs.png"
                      alt="Docs Logo"
                      width={24}
                      height={24}
                    />
                    <span className="text-xs sm:text-lg font-medium">
                      How it works
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isInMaintenance) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/70" />
          <div className="flex flex-col relative z-10 p-4 py-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl max-w-md gap-6">
            <h2 className="text-xl font-bold text-center text-green-400">
              Ongoing Maintenance
            </h2>
            <p className="text-white/90 text-md text-center leading-relaxed">
              We&apos;re working to fix an issue with the weekly leaderboard.
            </p>
            <p className="text-white/90 text-md text-center leading-relaxed">
              Thank you for your patience!
            </p>
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
        <GameProvider initialOverlay={initialOverlay}>{children}</GameProvider>
      )}
    </main>
  );
}
