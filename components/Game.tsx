"use client";

import { useFrameContext } from "@/context/FrameContext";
import { OverlayConfig } from "@/context/GameContext";
import { useSignIn } from "@/hooks/use-sign-in";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { GameProvider } from "./../context/GameContext";
import { getThisWeekMonday } from "@/lib/utils";
import { Maintenance } from "./home/maintenance";
import { Website } from "./home/website";

export default function Game({
  children,
  initialOverlay,
}: {
  children?: React.ReactNode;
  initialOverlay?: OverlayConfig;
}) {
  const { isSDKLoaded, context } = useFrameContext();
  const [isInMaintenance, setIsInMaintenance] = useState(true);

  // const monday = new Date("2025-04-13T18:17:30+02:00");
  const monday = getThisWeekMonday();
  const maintenanceStart = new Date(monday.getTime() - 5 * 60 * 1000); // 5 minutes before
  const maintenanceEnd = new Date(monday.getTime() + 30 * 60 * 1000); // 30 minutes after

  const checkMaintenance = () => {
    const now = new Date();
    return now >= maintenanceStart && now <= maintenanceEnd;
  };

  useEffect(() => {
    setIsInMaintenance(checkMaintenance());
    const interval = setInterval(() => {
      setIsInMaintenance(checkMaintenance());
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  const { isSignedIn, isLoading, error } = useSignIn(isInMaintenance);

  if (!context && isSDKLoaded && !isLoading) {
    return <Website />;
  }

  if (isInMaintenance) {
    return <Maintenance maintenanceEnd={maintenanceEnd} />;
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
            <p className="text-red-100/80 text-sm mt-2">
              Please contact @0xcaso, @itsmide.eth or @limone.eth
            </p>
          </div>
        </div>
      )}
      {isSignedIn && (
        <GameProvider initialOverlay={initialOverlay}>{children}</GameProvider>
      )}
    </main>
  );
}
