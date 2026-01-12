"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
import { useState } from "react";
import ArchivedLeaderboardModal from "./ArchivedLeaderboardModal";
import ArchivedFeudsLeaderboard from "./ArchivedFeudsLeaderboard";

type LeaderboardView = "none" | "players" | "feuds";

export default function RiseOfFarmsModal() {
  const [leaderboardView, setLeaderboardView] =
    useState<LeaderboardView>("none");

  const handlePlayOnFarcaster = () => {
    sdk.actions.openUrl(
      "https://farcaster.xyz/miniapps/UqCJjqsE8BKS/rise-of-farms"
    );
  };

  const handlePlayOnBase = () => {
    sdk.actions.openUrl("cbwallet://miniapp?url=https://riseof.farm");
  };

  const handleCloseLeaderboard = () => {
    setLeaderboardView("none");
  };

  // Show leaderboard views
  if (leaderboardView === "players") {
    return <ArchivedLeaderboardModal onClose={handleCloseLeaderboard} />;
  }

  if (leaderboardView === "feuds") {
    return <ArchivedFeudsLeaderboard onClose={handleCloseLeaderboard} />;
  }

  return (
    <Dialog open={true}>
      <DialogContent
        className="bg-gradient-to-br w-full h-full p-4 from-[#7E4E31] to-[#6D4C2C] border-[#8B5E3C] rounded-lg overflow-hidden flex flex-col"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-white/90 text-xl font-bold text-center">
            Thanks for Playing Farville! 🌾❤️
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 no-scrollbar">
          {/* Image */}
          <div className="flex justify-center flex-col text-center gap-4">
            <p className="font-bold text-white text-xs">
              Farville has evolved into Rise of Farms!
            </p>
            <Image
              src="/images/rof.png"
              alt="Rise of Farms"
              width={100}
              height={100}
              className="rounded-lg m-auto"
            />
          </div>

          {/* Description */}
          <div className="text-white/80 text-xs text-center space-y-3">
            <p>
              Rise of Farms is the new game where the items you grow and collect
              become real assets you can earn from.
            </p>
            <p>
              Soon, your OG NFT, collectibles, and stats will be brought into
              your new profile on Rise of Farms, forever.
            </p>
            <p className="text-[#FFB938] font-semibold">
              Start your new adventure now!
            </p>
          </div>

          {/* Play Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handlePlayOnFarcaster}
              className="w-full flex justify-center items-center gap-2 rounded-xl text-sm py-3 bg-[#6A3CFF] hover:bg-[#6A3CFF] text-white font-bold"
            >
              <Image
                src="/images/fc-logo.png"
                alt="Farcaster"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              Play on Farcaster
            </Button>
            <Button
              onClick={handlePlayOnBase}
              className="w-full flex justify-center items-center gap-2 rounded-xl text-sm py-3 bg-white hover:bg-white text-[#0029FE] font-bold"
            >
              <div className="w-5 h-5 bg-[#0029FE] rounded-sm"></div>
              Play on Base
            </Button>
          </div>

          {/* Archived Leaderboards Section */}
          <div className="border-t border-[#8B5E3C]/50 pt-4">
            <p className="text-white/60 text-[10px] text-center mb-3">
              📜 View your rankings
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setLeaderboardView("players")}
                variant="outline"
                className="flex-1 flex justify-center items-center gap-2 rounded-xl text-xs py-2 bg-[#5c4121]/50 hover:bg-[#5c4121] border-[#8B5E3C]/50 text-white/80 hover:text-white"
              >
                🏆 Leaderboard
              </Button>
              <Button
                onClick={() => setLeaderboardView("feuds")}
                variant="outline"
                className="flex-1 flex justify-center items-center gap-2 rounded-xl text-xs py-2 bg-[#5c4121]/50 hover:bg-[#5c4121] border-[#8B5E3C]/50 text-white/80 hover:text-white"
              >
                🛡️ Feuds
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
