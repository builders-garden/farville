// filepath: /Users/matteocasonato/Desktop/GitHub/farville/components/farmers-power/power-tab/how-it-works.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface HowItWorksProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HowItWorks = ({ isOpen, onOpenChange }: HowItWorksProps) => {
  return (
    <>
      <Button
        size="sm"
        className="text-yellow-400/80 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 w-full text-xs h-fit py-2"
        onClick={() => onOpenChange(true)}
      >
        How does this work?
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={onOpenChange}
      >
        <DialogContent
          showCloseButton={false}
          className="bg-[#7e4e31] border-yellow-400/20 max-w-[90%] max-h-[85vh] overflow-y-auto text-white rounded-lg no-scrollbar"
        >
          <div className="flex justify-between items-center">
            <DialogTitle className="text-md font-semibold text-white/90">
              Farmers Power???
            </DialogTitle>
            <DialogClose
              className="w-6 h-6 flex items-center justify-center rounded-full 
              bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X size={16} />
            </DialogClose>
          </div>

          <div className="text-xs">
            <div className="bg-[#4A341A] p-4 rounded-lg border border-yellow-400/10 mb-4">
              <p className="text-yellow-400 font-semibold mb-2">
                Farmers Power (FP) is the driving force behind Farville
              </p>
              <p className="text-white/90">
                When players contribute FP, it increases the total power level,
                which{" "}
                <span className="italic">
                  boosts the overall game speed for everyone
                </span>
                .
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-yellow-500 rounded-full mt-1.5 mr-2" />
                <p className="text-white/90">
                  There are{" "}
                  <span className="font-bold text-yellow-400">
                    24 stages of FP
                  </span>{" "}
                  — each new stage increases the game&apos;s speed multiplier
                  (for example, at stage 10, the entire game runs at 10x speed).
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-yellow-500 rounded-full mt-1.5 mr-2" />
                <p className="text-white/90">
                  FP isn&apos;t permanent. Every 10 minutes, the total FP
                  decreases by 1 point, so the community needs to{" "}
                  <span className="italic">
                    keep contributing to maintain or grow it
                  </span>
                  .
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-yellow-500 rounded-full mt-1.5 mr-2" />
                <p className="text-white/90">
                  <span className="font-bold text-yellow-400">
                    Power Combo mechanic:
                  </span>{" "}
                  If someone contributes within 10 minutes of the last donation,
                  the combo continues and increases. The higher the combo, the
                  stronger your contribution becomes. At the max combo of x10, a
                  single FP contribution counts as 10!
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-yellow-500 rounded-full mt-1.5 mr-2" />
                <p className="text-white/90">
                  A leaderboard tracks the top FP contributors. We&apos;ll be
                  rewarding top farmers with special in-game perks in future
                  updates.
                </p>
              </div>
            </div>

            <p className="mt-4 text-yellow-400/80 italic text-center border-t border-yellow-400/10 pt-3">
              Note: We&apos;re still tuning the system, so things like cooldown
              time or FP needed per stage might change — but we&apos;ll always
              let you know in advance.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
