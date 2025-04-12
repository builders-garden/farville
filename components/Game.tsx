"use client";

import { useFrameContext } from "@/context/FrameContext";
import { OverlayConfig } from "@/context/GameContext";
import { useSignIn } from "@/hooks/use-sign-in";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import React from "react";
import { GameProvider } from "./../context/GameContext";

export default function Game({
  children,
  initialOverlay,
}: {
  children?: React.ReactNode;
  initialOverlay?: OverlayConfig;
}) {
  const { isSDKLoaded, context } = useFrameContext();

  const isInMaintenance = false;

  const { isSignedIn, isLoading, error } = useSignIn(isInMaintenance);

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

  if (!context && isSDKLoaded && !isLoading) {
    return (
      <main className="min-h-screen w-screen overflow-y-auto lg:overflow-hidden bg-[#1E3320] bg-[conic-gradient(#265B3B_90deg,_#396549_90deg_180deg,_#265B3B_180deg_270deg,_#396549_270deg)] bg-[length:144px_144px]">
        <div className="flex items-center justify-center min-h-screen py-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="lg:block hidden relative w-[300px] h-[600px] rounded-[40px] bg-black border-2 border-zinc-900 shadow-2xl transition-transform duration-300 hover:scale-105">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[30px] bg-black rounded-b-[20px] border-x-2 border-b-2 border-zinc-900" />
              <div className="absolute inset-3 rounded-[32px] overflow-hidden bg-gray-800">
                <video
                  src="https://i.imgur.com/eCBtpU9.mp4"
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-auto px-4 lg:px-0">
              <div className="flex flex-col justify-between gap-8 bg-white rounded-3xl p-4 lg:p-8 shadow-lg w-full lg:w-[500px] h-auto lg:h-[500px]">
                <div className="flex flex-col gap-4">
                  <div className="block lg:hidden w-[280px] mx-auto aspect-[9/16] rounded-[40px] bg-black border-2 border-zinc-900 shadow-2xl relative mb-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[30px] bg-black rounded-b-[20px] border-x-2 border-b-2 border-zinc-900" />
                    <div className="absolute inset-3 rounded-[32px] overflow-hidden bg-gray-800">
                      <div className="relative w-full h-full">
                        <video
                          src="https://i.imgur.com/eCBtpU9.mp4"
                          autoPlay
                          muted
                          loop
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4 items-center">
                    <Image
                      src="/images/splash.png"
                      alt="Farville Logo"
                      className="h-16 w-auto object-contain"
                      width={96}
                      height={96}
                    />
                    <div className="flex flex-col gap-2">
                      <h1 className="text-xl font-bold text-zinc-900">
                        Farville
                      </h1>
                      <p className="text-zinc-500 text-xs">
                        Built by{" "}
                        <a
                          href="https://builders.garden"
                          target="_blank"
                          className="text-zinc-600 underline text-xs hover:text-zinc-900 transition-colors"
                        >
                          Builders Garden
                        </a>{" "}
                        team
                      </p>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm">
                    Plant, grow, and harvest crops with friends.
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="hidden lg:block rounded-xl p-2 border-2 border-zinc-300 w-fit h-full flex items-center justify-center">
                    <QRCodeSVG value="https://warpcast.com/~/frames/launch?domain=farville.farm" />
                  </div>
                  <div className="flex flex-col md:flex-row lg:flex-col w-full gap-4">
                    <a
                      href="https://warpcast.com/~/frames/launch?domain=farville.farm"
                      target="_blank"
                      className="w-full py-1 bg-[#8A63D2] text-white rounded-xl flex flex-row gap-2 items-center justify-start transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <Image
                        src="/images/fc-logo.png"
                        alt="Farcaster Logo"
                        width={64}
                        height={64}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs text-white/70">Play on</span>
                        <span className="text-lg white">Farcaster</span>
                      </div>
                    </a>

                    <a
                      href="https://docs.farville.farm/gameplay"
                      target="_blank"
                      className="w-full p-2 border-2 border-[#8A63D2] text-[#8A63D2] rounded-xl flex flex-row gap-2 items-center justify-start transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <Image
                        src="/images/docs.png"
                        alt="Docs Logo"
                        width={48}
                        height={48}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm">How it works</span>
                        <span className="text-xs text-purple-200">
                          Game Docs
                        </span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <a
                href="https://warpcast.com/~/frames/launch?domain=farville.farm"
                className="flex flex-row w-full gap-2 bg-white rounded-xl p-2 transition-all duration-300 hover:scale-105"
              >
                <Image
                  src="/images/channel.png"
                  alt="Farcaster Logo"
                  width={36}
                  height={36}
                />
                <div className="flex flex-col">
                  <p className="w-full flex flex-row gap-2 items-center justify-start cursor-pointer text-zinc-600">
                    Follow our channel
                  </p>
                  <p className="text-xs text-zinc-400">
                    Get the latest news and updates
                  </p>
                </div>
              </a>
            </div>
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
