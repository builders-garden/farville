"use client";

import { useFrameContext } from "@/context/FrameContext";
import { OverlayConfig } from "@/context/GameContext";
import { useTestMode } from "@/context/TestContext";
import { useSignIn } from "@/hooks/use-sign-in";
import { getThisWeekMonday } from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GameProvider } from "./../context/GameContext";
import { Maintenance } from "./home/maintenance";
import { Website } from "./home/website";
import { SocketAuthenticator } from "./SocketAuthenticator";
// import { BotBlocker } from "./home/bot-blocker";

export default function Game({
  children,
  initialOverlay,
}: {
  children?: React.ReactNode;
  initialOverlay?: OverlayConfig;
}) {
  const { isSDKLoaded, context } = useFrameContext();
  const [isInMaintenance, setIsInMaintenance] = useState(true);
  const { isTestMode } = useTestMode();

  // const monday = new Date("2025-05-30T18:15:00+02:00");
  const monday = getThisWeekMonday();
  const maintenanceStart = new Date(monday.getTime() - 5 * 60 * 1000); // 5 minutes before
  // const maintenanceEnd = new Date(monday.getTime() + 30 * 60 * 1000); // 30 minutes after
  const maintenanceEnd = new Date(monday.getTime() + 60 * 60 * 1000); // 60 minutes after

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

  const {
    isSignedIn,
    isLoading,
    error,
    signIn,
    // isBot
  } = useSignIn(isInMaintenance);

  const pathname = usePathname();
  const isRedeemPath = pathname.startsWith("/redeem/");

  const isFromBrowser = !context && isSDKLoaded && !isLoading && !isTestMode;

  const searchParams = useSearchParams();
  const voucherIdFromQueryParams = searchParams.get("redeem");
  const router = useRouter();

  useEffect(() => {
    if (isRedeemPath && isFromBrowser) {
      const voucherId = pathname.split("/redeem/")[1];
      const url = `https://farcaster.xyz/miniapps/WoLihpyQDh7w/farville?redeem=${voucherId}`;
      window.location.href = url;

      return;
    } else if (voucherIdFromQueryParams && !isFromBrowser) {
      // let's redirect from https://farville.farm?redeem=voucherId to https://farville.farm/redeem/voucherId
      const url = `/redeem/${voucherIdFromQueryParams}`;
      router.push(url);
      return;
    }
  }, [isRedeemPath, pathname, isFromBrowser, voucherIdFromQueryParams, router]);

  if (isFromBrowser) {
    return <Website />;
  }

  // if (isBot) {
  //   return <BotBlocker />;
  // }

  if (isInMaintenance) {
    return <Maintenance maintenanceEnd={maintenanceEnd} />;
  }

  return (
    <main className="h-screen w-screen max-w-md mx-auto overflow-hidden">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-10 flex flex-col items-center gap-8 max-w-md px-4 w-fit">
            <div className="p-4 bg-red-500/20 backdrop-blur-sm rounded-lg border-2 border-red-500 shadow-lg">
              <div className="flex flex-col gap-2">
                <p className="text-red-100 text-lg font-medium text-center">
                  Sign in failed
                </p>
                <p className="text-white/50 text-xs font-medium text-center mt-2 pt-2 border-red-500/30">
                  {error}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                className="bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold  w-full
                 hover:bg-[#ffc661] transition-colors"
                onClick={signIn}
              >
                Try again
              </button>
              <button
                className="bg-transparent text-[#FFB938] px-4 py-2 rounded-lg font-bold border-2 border-[#FFB938]
                 hover:bg-[#FFB938] hover:text-[#7E4E31] transition-colors w-full"
                onClick={() => {
                  sdk.actions.openUrl(
                    "https://farcaster.xyz/~/inbox/create/5698"
                  );
                }}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}
      {isSignedIn && (
        <GameProvider initialOverlay={initialOverlay}>
          <SocketAuthenticator />
          {children}
        </GameProvider>
      )}
    </main>
  );
}
