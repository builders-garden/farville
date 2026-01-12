"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";

export default function RiseOfFarmsModal() {
  const handlePlayOnFarcaster = () => {
    sdk.actions.openUrl(
      "https://farcaster.xyz/miniapps/UqCJjqsE8BKS/rise-of-farms"
    );
  };

  const handlePlayOnBase = () => {
    sdk.actions.openUrl("cbwallet://miniapp?url=https://riseof.farm");
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="bg-gradient-to-br w-full h-full p-4 from-[#7E4E31] to-[#6D4C2C] border-[#8B5E3C] rounded-lg"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white/90 text-xl font-bold text-center">
            Thanks for Playing Farville! 🌾❤️
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="flex justify-center">
            <Image
              src="/images/rof.png"
              alt="Rise of Farms"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>

          {/* Description */}
          <div className="text-white/80 text-xs text-center space-y-3">
            <p className="font-bold text-white">
              Farville has evolved into Rise of Farms!
            </p>
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

          {/* Buttons */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
