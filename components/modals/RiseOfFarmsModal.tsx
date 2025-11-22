"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";

interface RiseOfFarmsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiseOfFarmsModal({
  isOpen,
  onClose,
}: RiseOfFarmsModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideRiseOfFarmsModal", "true");
    }
    onClose();
  };

  const handleVisitChannel = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideRiseOfFarmsModal", "true");
    }
    // Open the Rise of Farms channel using Farcaster SDK
    sdk.actions.openUrl("https://farcaster.xyz/~/channel/rise-of-farms");
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent
        className="bg-gradient-to-br max-w-[90vw] p-4 from-[#7E4E31] to-[#6D4C2C] border-[#8B5E3C] rounded-lg"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-white/90 text-xl font-bold text-center">
            Rise of Farms is Coming!
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
            <p>Farville is evolving.</p>
            <p>
              In Rise of Farms, the items you grow and collect become real
              assets you can earn from.
            </p>
            <p>
              Plant, harvest, and upgrade your way into a farm that rewards your
              time and skill.
            </p>
          </div>

          {/* Checkbox */}
          <div className="flex items-center space-x-2 px-2">
            <Checkbox
              id="dontShowAgain"
              checked={dontShowAgain}
              onCheckedChange={(checked) =>
                setDontShowAgain(checked as boolean)
              }
              className="border-white/40 data-[state=checked]:bg-[#FFB938] data-[state=checked]:border-[#FFB938]"
            />
            <label
              htmlFor="dontShowAgain"
              className="text-xs text-white/70 cursor-pointer select-none"
            >
              Don&apos;t show this anymore
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-transparent border-[#8B5E3C] text-white/80 hover:bg-white/10 hover:text-white"
            >
              Dismiss
            </Button>
            <Button
              onClick={handleVisitChannel}
              className="flex-1 bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc661] font-bold"
            >
              Learn More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
